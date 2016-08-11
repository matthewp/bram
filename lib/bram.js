var Bram = {};

var forEach = Array.prototype.forEach;
var some = Array.prototype.some;

Bram.template = function(template){
  template = (template instanceof HTMLTemplateElement) ? template : document.querySelector(template);
  var paths = inspect(template.content, {id:0}, {});

  return function(model){
    var frag = document.importNode(template.content, true);
    hydrate(frag, paths, model);
    return frag;
  };
};

function inspect(node, ref, paths) {

  switch(node.nodeType) {
    // Element
    case 1:
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

function hydrate(frag, callbacks, model) {
  var paths = Object.keys(callbacks);
  var id = +paths.shift();
  var cur = 0;

  traverse(frag);

  function check(node) {
    cur++;
    if(id === cur) {
      var callback = callbacks[id];
      callback(node, model);
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
  }
};

function setupBinding(model, prop, fn){
  var set = function(ev, newVal){
    fn(newVal);
  };

  Bram.addEventListener(model, prop, set);
  set({}, model[prop]);
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

function observe(o, fn) {
  return new Proxy(o, {
    set(target, property, value) {
      target[property] = value;
      fn({
        prop: property,
        type: 'set'
      }, value);
    },
  })
}

var events = Symbol('bram-events');

Bram.model = function(o){
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

Bram.addEventListener = function(model, prop, callback){
  var evs = model[events];
  var ev = evs[prop];
  if(!ev) {
    ev = evs[prop] = [];
  }
  ev.push(callback);
};

Bram.off = function(model){
  model[events] = {};
};

if(typeof module === "object" && module.exports) {
  module.exports = Bram;
} else {
  window.Bram = Bram;
}
