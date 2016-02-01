
(function(undefined) {
'use strict';
var Bram = {};

var supportsSymbol = typeof Symbol === "function";
var INTERNAL_PROPS = supportsSymbol ? Symbol("[[ObservableProps]]") : "[[ObservableProps]]";
var INTERNAL_PROPIDS = supportsSymbol ? Symbol("[[ObservablePropIds]]") : "[[ObservablePropIds]]";
var CID = supportsSymbol ? Symbol("[[BramCID]]") : "[[BramCID]]";

var slice = Array.prototype.slice;

function makeObservable(element, eventName) {
  return Bram.on(element, eventName)
    .map(function(ev) {
      ev.stopPropagation();
      return ev.detail;
    });
}

function setupProps(obj, props) {
  Object.defineProperty(obj, CID, {
    enumerable: false, writable: true, configurable: false,
    value: 0
  });

  props.forEach(function(prop){
    Object.defineProperty(obj, prop, {
      get: function(){
        return getProps(this)[prop];
      },
      set: function(val){
        // Trigger a custom event that this observable will get
        var id = getPropIds(this)[prop];
        Bram.send(this, val, id, false);
      }
    });
  });
}

function makeProps(element, propNames) {
  var tag = element.tagName.toLowerCase();
  var proto = Object.getPrototypeOf(element);
  var propIds = getPropIds(element);
  var props = getProps(element);
  propNames.forEach(function(prop){
    var id = propIds[prop] = tag + "-" + prop + "-" + proto[CID]++;
    props[prop] = makeObservable(element, id);
  });
}

function defineProps(obj) {
  Object.defineProperty(obj, INTERNAL_PROPS, {
    enumerable: false, writable: false, configurable: false,
    value: {}
  });
  Object.defineProperty(obj, INTERNAL_PROPIDS, {
    enumerable: false, writable: false, configurable: false,
    value: {}
  });
}

function getProps(obj) {
  return obj[INTERNAL_PROPS];
}

function getPropIds(obj) {
  return obj[INTERNAL_PROPIDS];
}

Bram.element = function(defn){
  var parentProto;
  if(defn.extends) {
    parentProto = defn.extends.proto ? defn.extends.proto : defn.extends;
  } else {
    parentProto = HTMLElement.prototype;
  }

  var proto = Object.create(parentProto);

  var protoFunctions = defn.proto || defn.prototype || {};
  Object.keys(protoFunctions).forEach(function(key){
    var desc = Object.getOwnPropertyDescriptor(protoFunctions, key);
    var type = typeof desc.value;
    if(type === "function" || type === "object" || desc.get) {
      Object.defineProperty(proto, key, desc);
    }
  });

  if(defn.props) {
    setupProps(proto, defn.props);
  }

  proto.createdCallback = function(){
    if(defn.props && !getProps(this)) {
      defineProps(this);
      makeProps(this, defn.props);
    }

    var root;
    if(defn.template) {
      var t = defn.template instanceof HTMLTemplateElement ?
        defn.template : document.querySelector(defn.template);
      var clone = document.importNode(t.content, true);

      root = (defn.useShadow !== false && this.createShadowRoot) ?
        this.createShadowRoot() : this;
      root.appendChild(clone);

      this.bind = Binding.fromHost(this, root);
    }

    if(defn.created) {
      defn.created.call(this, this.bind, root);
    }
  };

  if(defn.attr) {
    proto.attributeChangedCallback = defn.attr;
  }

  proto.attachedCallback = function(){
    if(this._bindings)
      this._bindings._bind();
    if(defn.attached)
      return defn.attached.apply(this, arguments);
  }

  proto.detachedCallback = function(){
    if(this._bindings)
      this._bindings._unbind();
    if(defn.detached)
      return defn.detached.apply(this, arguments);
  };

  var registerOptions = {
    prototype: proto
  };
  if(defn.extends && defn.extends.tag)
    registerOptions.extends = defn.extends.tag;

  return document.registerElement(defn.tag, registerOptions);
};

if(typeof Rx === 'object' && Rx.Observable)
  Bram.Observable = Rx.Observable;
else if(typeof Observable === 'function')
  Bram.Observable = Observable;
else {
  console.error('Bram requires an Observable');
  return;
}

Bram.on = function(element, eventName){
  return Bram.Observable.fromEvent
    ? Bram.Observable.fromEvent(element, eventName)
    : new Bram.Observable(function(observer){
    // Create an event handler which sends data to the sink
    var handler = function(event) { observer.next(event); }

    // Attach the event handler
    element.addEventListener(eventName, handler, true);

    // Return a function which will cancel the event stream
    return function(){
      // Detach the event handler from the element
      element.removeEventListener(eventName, handler, true);
    };
  });
}

Bram.listen = function(element){
  var eventName = 'bram-appchange';
  if(arguments.length === 1) {
    // element-contextual eventName
    var proto = Object.getPrototypeOf(element);
    if(!proto[CID]) {
      Object.defineProperty(proto, CID, {
        enumerable: false, writable: false, configurable: false,
        value: 0
      });
    }
    var cid = proto[CID]++;
    eventName = eventName + '-' + element.tagName.toLowerCase() + '-' + cid;

    element.send = function(observable){
      Bram.send(this, observable, eventName, false);
    };
  }
  element = element || document.body;

  var observable = Bram.on(element, eventName)
    .map(function(ev) {
      ev.stopPropagation();
      return ev.detail;
    });
  observable.eventName = eventName;
  return observable;
};

Bram.trigger = function(el, val, eventName, bubbles){
  var event = new CustomEvent(eventName, {
    bubbles: bubbles !== false,
    detail: val
  });
  el.dispatchEvent(event);
};

Bram.send = function(el, observable, eventName, bubbles){
  if(arguments.length === 2) {
    eventName = 'bram-appchange';
  }

  // TODO save this subscription
  var subscription = observable.subscribe(function(val){
    Bram.trigger(el, val, eventName, bubbles);
  });

};

Bram.Binding = Binding;

function Binding(host, root){
  this.host = host;
  this.root = root;
}

Binding.fromHost = function(host, root){
  root = root || host;
  return function(selector){
    var element = Binding.prototype._getElement.call({ root: root }, selector);
    return new Binding(element, root);
  };
};

Binding.prototype = {
  _getElement: function(selector){
    return typeof selector === 'string' ? this.root.querySelector(selector) :
      selector;
  },

  _setup: function(observable, setter, tester){
    // TODO register this
    var self = this;
    tester = tester || truthy;
    observable.subscribe(function(value){
      if(tester.call(self, value)) {
        setter.call(self, value);
      }
    });
  },

  attr: function(attrName, o){
    this._setup(o, function(value){
      this.host.setAttribute(attrName, value);
    }, function(value){
      return this.host.getAttribute(attrName) !== value;
    });
    return this;
  },

  condAttr: function(attrName, o) {
    var oldValue;
    this._setup(o, function(value){
      value = !!value;
      if(value && oldValue !== value) {
        this.host.setAttribute(attrName, '');
        oldValue = value;
      } else if(oldValue !== value) {
        this.host.removeAttribute(attrName);
        oldValue = value;
      }
    });
    return this;
  },

  when: function(o, template, fn){
    var t = this._getElement(template);
    var prev, bind, children = [];
    this._setup(o, function(value){
      if(value) {
        var clone = document.importNode(t.content, true);
        bind = Binding.fromHost(this, clone);
        fn.call(this, bind);

        children = slice.call(clone.childNodes);
        this.host.appendChild(clone);
      } else {
        children.forEach(function(child){
          child.parentNode.removeChild(child);
        });
        children = [];
      }
      prev = !!value;
    }, function(value){
      return prev !== !!value;
    });
    return this;
  },

  hideWhen: function(o){
    var current = this.host.style.display;
    this._setup(o, function(hide){
      var val = hide ? 'none': current;
      if(this.host.style.display !== val) {
        this.host.style.display = val;
      }
    });
    return this;
  },

  list: function(o, options, fn){
    var t = this._getElement(options.template);
    var key = options.key;

    var parent = this.host;
    var inserted = {};

    this._setup(o, function(list){
      var ids = list.reduce(function(acc, item, i){
        var id = item[key];
        var inDom = inserted[id];
        if(!inDom) {
          var clone = document.importNode(t.content, true);
          fn.call(null, clone, item, i);

          inserted[id] = slice.call(clone.childNodes);
          parent.appendChild(clone);
        }
        acc[id] = true;
        return acc;
      }, {});

      Object.keys(inserted).forEach(function(id){
        var inList = ids[id];
        if(!inList) {
          var nodes = inserted[id];
          nodes.forEach(function(node){
            node.parentNode.removeChild(node);
          });
          delete inserted[id];
        }
      });
    });

    return this;
  }

};

[ { name: 'text', prop: 'textContent' }, 'value' ].forEach(function(prop){
  var name = prop.name || prop;
  prop = prop.prop || prop;
  Binding.prototype[name] = function(o){
    this._setup(o, function(value){
      this.host[prop] = value;
    }, function(value){
      return this.host[prop] !== value;
    });
    return this;
  };
});

function truthy() { return true; }

if(typeof module !== "undefined" && module.exports) {
  module.exports = Bram;
} else {
  window.Bram = Bram;
}

})();
