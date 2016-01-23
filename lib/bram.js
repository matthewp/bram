var Bram = {};

var supportsSymbol = typeof Symbol === "function";
var INTERNAL_PROPS = supportsSymbol ? Symbol("[[ObservableProps]]") : "[[ObservableProps]]";
var INTERNAL_PROPIDS = supportsSymbol ? Symbol("[[ObservablePropIds]]") : "[[ObservablePropIds]]";
var CID = supportsSymbol ? Symbol("[[BramCID]]") : "[[BramCID]]";

var slice = Array.prototype.slice;

function makeObservable(element, eventName) {
  return Bram.listen(element, eventName)
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

      this._bindings = new Bind(this, root);
    }

    if(defn.created) {
      defn.created.call(this, this._bindings, root);
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

Bram.listen = function(element, eventName){
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

Bram.mailbox = function(element){
  var address = 'bram-appchange';
  if(arguments.length === 1) {
    // element-contextual address
    var proto = Object.getPrototypeOf(element);
    if(!proto[CID]) {
      Object.defineProperty(proto, CID, {
        enumerable: false, writable: false, configurable: false,
        value: 0
      });
    }
    var cid = proto[CID]++;
    address = address + '-' + element.tagName.toLowerCase() + '-' + cid;

    element.send = function(observable){
      Bram.send(this, observable, address, false);
    };
  }
  element = element || document.body;

  var observable = Bram.listen(element, address);
  return observable.map(function(ev) {
    ev.stopPropagation();
    return ev.detail;
  });
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

function Binding(on, off){
  this._on = on;
  this._off = off;
};

Binding.prototype.on = function(){
  if(!this.bound) {
    this._on();
    this.bound = true;
  }
};

Binding.prototype.off = function(){
  if(this.bound) {
    this._off();
    this.bound = false;
  }
};

function Bind(el, shadow){
  this.el = el;
  this.shadow = shadow;
  this._bindings = [];
}

Bind.prototype._getElement = function(selector, root){
  root = root || this.shadow;
  return typeof selector === "string" ? root.querySelector(selector) : selector;
};

Bind.prototype._register = function(binding){
  this._bindings.push(binding);
  binding.on();
};

Bind.prototype._bind = function(){
  this._bindings.forEach(function(binding){
    binding.on();
  });
};

Bind.prototype._unbind = function(){
  this._bindings.forEach(function(binding){
    binding.off();
  });
};

Bind.prototype._setup = function(selector, observable, setter){
  var el = this._getElement(selector);
  observable.subscribe(function(value){
    setter(el, value);
  });
};

Bind.prototype.text = function(selector, observable){
  this._setup(selector, observable, function(el, value){
    el.textContent = value;
  });
};

Bind.prototype.value = function(selector, observable){
  this._setup(selector, observable, function(el, value){
    if(el.value !== value) {
      el.value = value;
    }
  });
};

Bind.prototype.condAttr = function(selector, attrName, observable){
  var el = this._getElement(selector);

  observable.subscribe(function(value){
    if(value) {
      el.setAttribute(attrName, true);
    } else {
      el.removeAttribute(attrName);
    }
  });
};

Bind.prototype.hideWhen = function(selector, observable){
  var current = this._getElement(selector).style.display;
  this._setup(selector, observable, function(el, hide){
    var val = hide ? 'none': current;
    if(el.style.display !== val) {
      el.style.display = val;
    }
  });
};

Bind.prototype.list = function(observable, key, templateSelector,
                               hostSelector, callback){
  var t = this._getElement(templateSelector);
  var parent = this._getElement(hostSelector);
  var el = this.el;
  var inserted = {};

  observable.subscribe(function(list){
    var ids = list.reduce(function(acc, item, i){
      var id = item[key];
      var inDom = inserted[id];
      if(!inDom) {
        var clone = document.importNode(t.content, true);
        var bindings = new Bind(el, clone);
        callback.call(el, clone, item, i);

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
};

if(typeof module !== "undefined" && module.exports) {
  module.exports = Bram;
} else {
  window.Bram = Bram;
}
