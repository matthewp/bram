
(function(undefined) {
'use strict';
function Bram(Element) {
  return class extends Element {
    constructor() {
      super();

      let modelFn = new.target.model;
      this.model = Bram.model(modelFn ? modelFn() : {});

      let tmplFn = new.target.template;
      if(tmplFn) {
        this._hydrate = Bram.template(tmplFn());
      }
      this._hasRendered = false;
    }

    connectedCallback() {
      if(this._hydrate && !this._hasRendered) {
        let tree = this._hydrate(this.model);
        // TODO determine where to render
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(tree);
      }
    }
  }
}

Bram.Element = Bram(HTMLElement);

var forEach = Array.prototype.forEach;
var some = Array.prototype.some;
var slice = Array.prototype.slice;

Bram.values = Object.values || function(obj){
  return Object.keys(obj).reduce(function(acc, key){
    acc.push(obj[key]);
    return acc;
  }, []);
};

Bram.template = function(template){
  template = (template instanceof HTMLTemplateElement) ? template : document.querySelector(template);
  var paths = inspect(template.content, {id:0}, {});

  return function(scope){
    if(!(scope instanceof Scope)) {
      scope = new Scope(scope);
    }

    var frag = document.importNode(template.content, true);
    hydrate(frag, paths, scope);
    return frag;
  };
};

Bram.symbol = typeof Symbol === 'function' ? Symbol :
  function(str){
    return '@@-' + str;
  };

if(typeof module === "object" && module.exports) {
  module.exports = Bram;
} else {
  window.Bram = Bram;
}

if(typeof Map !== "function") {
  var bid = Bram.symbol('bid'),
    bidCnt = 1;

  function BID(obj){
    var type = typeof obj;
    if(type === 'string' || type === 'number')
      return obj;
    var id = obj[bid];
    if(!id) {
      Object.defineProperty(obj, bid, {
        value: id++,
        enumerable: false,
        writable: false,
        configurable: false
      });
    }
    return id;
  }

  function Map(){
    this.k = {};
  }
  Map.prototype.set = function(key, value){
    var id = BID(obj);
    this.k[id] = value;
  };
  Map.prototype.get = function(key){
    return this.k[BID(key)];
  };
  Map.prototype.delete = function(key){
    delete this.k[BID(key)];
  };
}


var live = {
  attr: function(node, attrName){
    return function(val){
      node.setAttribute(attrName, val);
    };
  },
  text: function(node){
    return function(val){
      node.nodeValue = val;
    };
  },
  prop: function(node, prop){
    return function(val){
      node[prop] = val;
    };
  },
  each: function(node, parentScope, parseResult){
    var hydrate = Bram.template(node);
    var prop = parseResult.props()[0];
    var scopeResult = parentScope.read(prop);
    var placeholder = document.createTextNode('');
    node.parentNode.replaceChild(placeholder, node);

    var observe = function(list){
      var itemMap = new Map();
      var indexMap = new Map();

      var render = function(item, i){
        var scope = parentScope.add(item).add({ item: item, index: i});
        var frag = hydrate(scope);

        var info = {
          item: item,
          nodes: slice.call(frag.childNodes),
          scope: scope,
          index: i
        };
        itemMap.set(item, info);
        indexMap.set(i, info);

        var siblingInfo = indexMap.get(i + 1);
        var parent = placeholder.parentNode;
        if(siblingInfo) {
          var firstChild = siblingInfo.nodes[0];
          parent.insertBefore(frag, firstChild);
        } else {
          parent.appendChild(frag);
        }
      };

      var remove = function(index){
        var info = indexMap.get(index);
        if(info) {
          info.nodes.forEach(function(node){
            node.parentNode.removeChild(node);
          });
          itemMap.delete(info.item);
          indexMap.delete(index);
        }
      };

      list.forEach(render);

      var onarraychange = function(ev, value){
        if(ev.type === 'delete') {
          remove(ev.index);
          return;
        }

        var info = itemMap.get(value);
        if(info) {
          var oldIndex = info.index;
          var hasChanged = oldIndex !== ev.index;
          if(hasChanged) {
            info.scope.model.index = info.index = ev.index;

            var existingItem = indexMap.get(ev.index);
            if(existingItem) {
              indexMap.set(oldIndex, existingItem);
            } else {
              indexMap.delete(oldIndex);
            }
            indexMap.set(ev.index, info);

            var ref = indexMap.get(ev.index + 1);
            if(ref) {
              ref = ref.nodes[0];
            }

            var nodeIdx = info.nodes.length - 1;
            while(nodeIdx >= 0) {
              placeholder.parentNode.insertBefore(info.nodes[nodeIdx], ref);
              nodeIdx--;
            }
          }
        } else {
          remove(ev.index);
          render(value, ev.index);
        }
      };

      Bram.addEventListener(list, Bram.arrayChange, onarraychange);

      return function(){
        for(var i = 0, len = list.length; i < len; i++) {
          remove(i);
        }
        Bram.removeEventListener(list, Bram.arrayChange, onarraychange);
        itemMap = null;
        indexMap = null;
      };
    };

    var teardown = observe(scopeResult.value);

    Bram.addEventListener(scopeResult.model, prop, function(ev, newValue){
      teardown();
      teardown = observe(newValue);
    });
  },
  if: function(node, parentScope){
    var hydrate = Bram.template(node);
    var rendered = false;
    var child = {};
    var placeholder = document.createTextNode('');
    node.parentNode.replaceChild(placeholder, node);
    return function(val){
      if(!rendered) {
        if(val) {
          var scope = parentScope.add(val);
          var frag = hydrate(scope);
          child.children = slice.call(frag.childNodes);
          child.scope = scope;
          placeholder.parentNode.insertBefore(frag, placeholder.nextSibling);
          rendered = true;
        }
      } else {
        var parent = placeholder.parentNode;
        var sibling = placeholder.nextSibling;
        if(val) {
          child.children.forEach(function(node){
            parent.insertBefore(node, sibling);
          });
        } else {
          child.children.forEach(function(node){
            parent.removeChild(node);
          });
        }
      }
    };
  }
};

function setupBinding(scope, parseResult, fn){
  var compute = parseResult.compute(scope);

  var set = function(){
    fn(compute());
  };

  parseResult.props().forEach(function(prop){
    var info = scope.read(prop);
    var model = info.model;
    if(info.bindable !== false) {
      Bram.addEventListener(model, prop, set);
    }
  });

  set();
}

function ParseResult(){
  this.values = {};
  this.raw = '';
  this.hasBinding = false;
  this.includesNonBindings = false;
}

ParseResult.prototype.getValue = function(scope){
  var prop = this.props()[0];
  return scope.read(prop).value;
}

ParseResult.prototype.getStringValue = function(scope){
  var asc = Object.keys(this.values).sort();
  var out = this.raw;
  var i, value;
  while(asc.length) {
    i = asc.pop();
    value = scope.read(this.values[i]).value;
    out = value ? out.substr(0, i) + value + out.substr(i) : undefined;
  }
  return out;
};

ParseResult.prototype.compute = function(model){
  var useString = this.includesNonBindings || this.count() > 1;
  return useString
    ? this.getStringValue.bind(this, model)
    : this.getValue.bind(this, model);
};

ParseResult.prototype.props = function(){
  return Bram.values(this.values);
};

ParseResult.prototype.count = function(){
  return this.hasBinding === false ? 0 : Object.keys(this.values).length;
};

ParseResult.prototype.throwIfMultiple = function(msg){
  if(this.count() > 1) {
    msg = msg || 'Only a single binding is allowed in this context.';
    throw new Error(msg);
  }
};

Bram.parse = parse;

function parse(str){
  var i = 0,
    len = str.length,
    result = new ParseResult(),
    inBinding = false,
    lastChar = '',
    pos = 0,
    char;

  while(i < len) {
    lastChar = char;
    char = str[i];

    if(!inBinding) {
      if(char === '{') {
        if(lastChar === '{') {
          result.hasBinding = true;
          pos = result.raw.length;
          if(result.values[pos] != null) {
            pos++;
          }
          result.values[pos] = '';
          inBinding = true;
        }

        i++;
        continue;
      }
      result.raw += char;
    } else {
      if(char === '}') {
        if(lastChar === '}') {
          inBinding = false;
        }
        i++;
        continue;
      }
      result.values[pos] += char;
    }

    i++;
  }

  result.includesNonBindings = result.raw.length > 0;
  return result;
}

function inspect(node, ref, paths) {
  var ignoredAttrs = {};

  switch(node.nodeType) {
    // Element
    case 1:
      var templateAttr;
      if(node.nodeName === 'TEMPLATE' && (templateAttr = specialTemplateAttr(node))) {
        var result = parse(node.getAttribute(templateAttr));
        if(result.hasBinding) {
          result.throwIfMultiple();
          ignoredAttrs[templateAttr] = true;
          paths[ref.id] = function(node, model){
            if(templateAttr === 'each') {
              live.each(node, model, result, node);
            } else {
              setupBinding(model, result, live[templateAttr](node, model));
            }
          };
        }
      }
      break;
    // TextNode
    case 3:
      var result = parse(node.nodeValue);
      if(result.hasBinding) {
        paths[ref.id] = function(node, model){
          setupBinding(model, result, live.text(node));
        };
      }
      break;
  }

  forEach.call(node.attributes || [], function(attrNode){
    // TODO see if this is important
    ref.id++;

    if(ignoredAttrs[attrNode.name])
      return;

    var name = attrNode.name;
    var property = isPropAttr(name);
    var result = parse(attrNode.value);
    if(result.hasBinding) {
      paths[ref.id] = function(node, model){
        if(property) {
          node.removeAttribute(name);
          setupBinding(model, result, live.prop(node, name.substr(1)));
          return;
        }
        setupBinding(model, result, live.attr(node, name));
      };
    } else if(property) {
      console.log('still do this');
    }
  });

  var childNodes = node.childNodes;
  forEach.call(childNodes, function(node){
    ref.id++;
    inspect(node, ref, paths);
  });

  return paths;
}

var specialTemplateAttrs = ['if', 'each'];
function specialTemplateAttr(template){
  var attrName;
  for(var i = 0, len = specialTemplateAttrs.length; i < len; i++) {
    attrName = specialTemplateAttrs[i];
    if(template.getAttribute(attrName))
      return attrName;
  }
}

function isPropAttr(name) {
  return name && name[0] === ':';
}


function hydrate(frag, callbacks, scope) {
  var paths = Object.keys(callbacks);
  var id = +paths.shift();
  var cur = 0;

  traverse(frag);

  function check(node) {
    cur++;
    if(id === cur) {
      var callback = callbacks[id];
      callback(node, scope);
      id = +paths.shift();
    }
    return !id;
  }

  function traverse(node){
    var exit;
    some.call(node.attributes || [], function(){
      exit = check(node);
      if(exit) {
        return true;
      }
    });
    if(exit) return false;

    some.call(node.childNodes, function(child){
      exit = check(child);
      if(exit) {
        return true;
      }

      exit = !traverse(child);
      if(exit) {
        return true;
      }
    });
    return !exit;
  }
}

Bram.Scope = Scope;

function Scope(model, parent) {
  this.model = model;
  this.parent = parent;
}

Scope.prototype.read = function(prop){
  return this._read(prop) || {
    model: this.model,
    value: undefined
  };
};

Scope.prototype._read = function(prop){
  var val = this.model[prop];
  if(val != null) {
    return {
      model: this.model,
      value: val
    };
  }
  if(this.parent) {
    return this.parent.read(prop);
  }
}

Scope.prototype.add = function(object){
  var model;
  if(Bram.isModel(object)) {
    model = object;
  } else {
    var type = typeof object;
    if(Array.isArray(object) || type === "object") {
      model = Bram.model(object);
    } else {
      model = object;
    }
  }

  return new Scope(model, this);
};

function isArraySet(object, property){
  return Array.isArray(object) && !isNaN(+property);
}

function isArrayOrObject(object) {
  return Array.isArray(object) || typeof object === 'object';
}

function observe(o, fn) {
  return new Proxy(o, {
    set: function(target, property, value) {
      var oldValue = target[property];
      if(!Bram.isModel(value) && isArrayOrObject(value)) {
        value = Bram.model(value);
      }
      target[property] = value;

      // If the value hasn't changed, nothing else to do
      if(value === oldValue)
        return true;

      if(isArraySet(target, property)) {
        fn({
          prop: Bram.arrayChange,
          index: +property,
          type: 'set'
        }, value);
      } else {
        fn({
          prop: property,
          type: 'set'
        }, value)
      }

      return true;
    },
    deleteProperty: function(target, property, value){
      if(isArraySet(target, property)) {
        fn({
          prop: Bram.arrayChange,
          index: +property,
          type: 'delete'
        });
      }

      return true;
    }
  })
}

var events = Bram.symbol('bram-events');
Bram.arrayChange = Bram.symbol('bram-array-change');

Bram.model = function(o){
  o = deepModel(o) || {};

  var callback = function(ev, value){
    var fns = o[events][ev.prop];
    if(fns) {
      fns.forEach(function(fn){
        fn(ev, value);
      });
    }
  };

  Object.defineProperty(o, events, {
    value: {},
    enumerable: false
  });

  return observe(o, callback);
};

function deepModel(o) {
  var copy;
  if(Array.isArray(o)) {
    copy = slice.call(o);
  } else if(o) {
    var proto = Object.getPrototypeOf(o),
    copy = Object.create(proto);
  }

  return !o ? o : Object.keys(o).reduce(function(acc, prop){
    var val = o[prop];
    acc[prop] = (Array.isArray(val) || typeof val === 'object')
      ? Bram.model(val)
      : val;
    return acc;
  }, copy);
}

Bram.isModel = function(object){
  return object && !!object[events];
};

Bram.addEventListener = function(model, prop, callback){
  var evs = model[events];
  if(!evs) return;
  var ev = evs[prop];
  if(!ev) {
    ev = evs[prop] = [];
  }
  ev.push(callback);
};

Bram.removeEventListener = function(model, prop, callback){
  var evs = model[events];
  if(!evs) return;
  var ev = evs[prop];
  if(!ev) return;
  var idx = ev.indexOf(callback);
  if(idx === -1) return;
  ev.splice(idx, 1);
  if(!ev.length) {
    delete evs[prop];
  }
};

Bram.off = function(model){
  model[events] = {};

  Object.keys(model).forEach(function(key){
    var val = model[key];
    if(Array.isArray(val) || typeof val === 'object') {
      Bram.off(val);
    }
  });
};

Bram.onChildren = function(element, callback){
  var cancelled = false;
  var report = function(){
    if(!cancelled) {
      callback(element.childNodes);
    }
  };

  var mo = new MutationObserver(report);
  mo.observe(element, { childList: true });

  if(element.childNodes.length) {
    Promise.resolve().then(report);
  }

  return function(){
    cancelled = true;
    mo.disconnect();
  };
};

})();
