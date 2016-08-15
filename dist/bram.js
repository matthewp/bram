
(function(undefined) {
'use strict';
var Bram = {};

var forEach = Array.prototype.forEach;
var some = Array.prototype.some;
var slice = Array.prototype.slice;

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

if(typeof module === "object" && module.exports) {
  module.exports = Bram;
} else {
  window.Bram = Bram;
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
  each: function(node, parentScope, prop){
    var hydrate = Bram.template(node);

    var info = parentScope.read(prop);
    var array = info.value;
    var comp = slice.call(array);
    var placeholder = document.createTextNode('');
    node.parentNode.replaceChild(placeholder, node);
    var children = [];

    var render = function(model, i){
      var scope = parentScope.add(model).add({item: model, index: i});
      var frag = hydrate(scope);

      var childNodes = slice.call(frag.childNodes);
      var parent = placeholder.parentNode;

      var sibling = children[i + 1];
      if(sibling) {
        var lastChild = sibling.nodes[0];
        parent.insertBefore(frag, lastChild);
      } else {
        parent.appendChild(frag);
      }

      children[i] = { scope: scope, nodes: childNodes };
    };

    array.forEach(render);

    Bram.addEventListener(array, Bram.arrayChange, function(ev, value){
      var child;
      var index = ev.index;
      var oldIndex = comp.indexOf(value);
      if(oldIndex !== -1) {
        child = children[oldIndex];
        children[index] = child;
        children[oldIndex] = undefined;
        child.scope.model.index = index;
      } else if((child = children[index])) {
        child.scope.model.item = value;
      } else {
        render(value, index);
      }
      comp = slice.call(array);
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

function setupBinding(scope, prop, fn){
  var set = function(ev, newVal){
    fn(newVal);
  };

  var info = scope.read(prop);
  var model = info.model;
  if(info.bindable === false) {
    set({}, model);
  } else {
    Bram.addEventListener(model, prop, set);
    set({}, model[prop]);
  }
}

function setupArrayBinding(scope, prop, fn) {
  var model = scope.read(prop).model,
    array = model[prop],
    length = array.length,
    key = Symbol('bram-array-binding');

  // Change the list when the list itself changes
  Bram.addEventListener(model, prop, function setArray(){
    array = model[prop];
  });

  array.forEach(function(item, i){
    item[key] = true;
    setupBinding(array, i, fn);
  });

  Bram.addEventListener(array, 'length', function(ev, newLength){
    // TODO new thing to set up.
    var i, item;

    // Push, look for new items added to the end.
    if(newLength > length) {
      i = newLength - 1;

      while((item = array[i]) && !item[key]) {
        setupBinding(new Scope(array), i, fn);

        i--;
      }
    }
  });
}

var bindingTypes = {
  auto: 0,
  oneway: 1
};

var isBindingChar = makeCharChecker("{}[]");
var isCallChar = makeCharChecker("()");

function makeCharChecker(str){
  var bindingChars = str.split("").reduce(function(acc, cur){
    acc[cur] = true;
    return acc;
  }, {});
  return function(char){
    return !!bindingChars[char];
  };
}

function getBindingType(bindingType) {
  switch(bindingType) {
    case bindingTypes.auto:
      return "auto";
    case bindingTypes.oneway:
      return "oneway";
  }
}

function parse(expr){
  var pos = 0, len = expr.length;
  var inBinding = false;
  var inCall = false;
  var char, bindingType;
  var args = "";
  var value = "";
  while(pos < len) {
    char = expr[pos];
    if(!inBinding) {
      if(char === "{") {
        inBinding = true;
        bindingType = bindingTypes.auto;
      } else if(char === "[") {
        inBinding = true;
        bindingType = bindingTypes.oneway;
      }
    } else if(!isBindingChar(char)){
      if(isCallChar(char) && value) {
        inCall = true;
      } else if(inCall) {
        if(char !== " ") {
          args += char;
        }
      } else {
        value += char;
      }
    }
    pos++;
  }

  var bindingTypeStr = getBindingType(bindingType);

  return {
    hasBinding: !!bindingTypeStr,
    hasCall: inCall,
    bindingType: bindingTypeStr,
    args: args.split(","),
    value: value
  };
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
          ignoredAttrs[templateAttr] = true;
          paths[ref.id] = function(node, model){
            if(templateAttr === 'each') {
              live.each(node, model, result.value, node);
            } else {
              setupBinding(model, result.value, live[templateAttr](node, model));
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
          setupBinding(model, result.value, live.text(node));
        };
      }
      break;
  }


  forEach.call(node.attributes || [], function(attrNode){
    // TODO see if this is important
    ref.id++;

    if(ignoredAttrs[attrNode.name])
      return;

    var result = parse(attrNode.value);
    if(result.hasBinding) {
      paths[ref.id] = function(node, model){
        setupBinding(model, result.value, live.attr(node, attrNode.name));
      };
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
  if(val) {
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
  var model = Bram.isModel(object) ? object : Bram.model(object);
  return new Scope(model, this);
};

function isArraySet(object, property){
  return Array.isArray(object) && !isNaN(+property);
}

function observe(o, fn) {
  return new Proxy(o, {
    set: function(target, property, value) {
      var oldValue = target[property];
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

    }
  })
}

var events = Symbol('bram-events');
Bram.arrayChange = Symbol('bram-array-change');

Bram.model = function(o){
  o = deepModel(o);

  var callback = function(ev, value){
    var fns = proxy[events][ev.prop];
    if(fns) {
      fns.forEach(function(fn){
        fn(ev, value);
      });
    }
  };

  var proxy = observe(o || {}, callback);

  Object.defineProperty(proxy, events, {
    value: {},
    enumerable: false
  });

  return proxy;
};

function deepModel(o) {
  return !o ? o : Object.keys(o).reduce(function(acc, prop){
    var val = o[prop];
    acc[prop] = (Array.isArray(val) || typeof val === "object")
      ? Bram.model(val)
      : val;
    return acc;
  }, Array.isArray(o) ? [] : {})
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

Bram.off = function(model){
  model[events] = {};
};

})();
