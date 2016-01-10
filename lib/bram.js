var ccompute = require("ccompute");

var Bram = {};

var INTERNAL_SETTERS = typeof Symbol === "function" ? Symbol("[[ComponentSetters]]") : "[[ComponentSetters]]";

function setupSetters(obj, setters) {
  var props = Object.keys(setters);
  props.forEach(function(prop){
    var fn = setters[prop];

    Object.defineProperty(obj, prop, {
      get: function(){
        return getSetters(this)[prop];
      },
      set: function(val){
        getSetters(this)[prop] = val;
        fn.call(this, this._bindings, val);
      }
    });
  });
}

function defineSetters(obj) {
  Object.defineProperty(obj, INTERNAL_PROPS, {
    enumerable: false, writable: false, configurable: false,
    value: {}
  });
}

function getSetters(obj) {
  return obj[INTERNAL_SETTERS];
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
    if(typeof desc.value === "function" || desc.get) {
      Object.defineProperty(proto, key, desc);
    }
  });

  if(defn.setters) {
    setupSetters(this, defn.setters);
  }

  proto.createdCallback = function(){
    var root;
    if(defn.template) {
      var t = document.querySelector(defn.template);
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

Bram.getOwnCompute = function(el, name){
  var props = getProps(el);
  return props ? props[name] : undefined;
};

Bram.observableToCompute = function(observable){
  var compute = ccompute();
  observable.subscribe(function(val){
    compute(val);
  });
  return compute;
};

Bram.compute = function(){
  return ccompute.apply(can, arguments);
};

function createStateProperty(obj, name){
  var desc = Object.getOwnPropertyDescriptor(obj, name);
  var compute;
  if(desc && desc.value) {
    compute = ccompute(desc.value);
  } else {
    compute = ccompute();
  }
  getProps(obj)[name] = compute;

  Object.defineProperty(obj, name, {
    get: function(){
      return getProps(this)[name]();
    },
    set: function(val){
      getProps(this)[name](val);
    }
  });
}

Bram.state = function(obj){
  var keys = Object.keys(obj);
  defineProps(obj);
  keys.forEach(function(key){
    createStateProperty(obj, key);
  });
  return obj;
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

Bind.prototype._getCompute = function(prop){
  if(typeof prop !== "string") return prop;
  var el = this.el;

  var compute = Bram.getOwnCompute(el, prop);
  if(compute) {
    return compute;
  }

  var proto = Object.getPrototypeOf(el);
  var desc = Object.getOwnPropertyDescriptor(proto, prop);
  if(desc.get) {
    compute = ccompute(desc.get, el);
  } else {
    compute = desc.value;
  }
  return compute;
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

Bind.prototype._setup = function(selector, prop, setter){
  var el = this._getElement(selector);
  var compute = this._getCompute(prop);
  var fn = function(){
    setter(el, compute);
  };

  this._register(new Binding(function(){
    compute.bind("change", fn);
  }, function(){
    compute.unbind("change", fn);
  }));
  fn();

};

Bind.prototype.text = function(prop, selector){
  this._setup(selector, prop, function(el, compute){
    el.textContent = compute();
  });
};

Bind.prototype.attr = function(prop, selector, attrName){
  this._setup(selector, prop, function(el, compute){
    el.setAttribute(attrName, compute());
  });
};

Bind.prototype.form = function(prop, selector, event){
  event = event || "change";
  var el = this._getElement(selector);
  var compute = this._getCompute(prop);

  var setForm = function(){
    el.value = compute();
  };
  var setCompute = function(){
    compute(el.value);
  };

  var binding = new Binding(function(){
    el.addEventListener(event, setCompute);
    compute.bind("change", setForm);
  }, function(){
    el.removeEventListener(event, setCompute);
    compute.unbind("change", setForm);
  });
  this._register(binding);

  if(compute()) {
    setForm();
  } else if(el.value) {
    setCompute();
  }
};

Bind.prototype.cond = function(prop, selector){
  var el = this._getElement(selector);
  var compute = this._getCompute(prop);
  var parent = el.parentNode;
  var ref = el.nextSibling;

  var position = function(){
    var inDom = !!el.parentNode;
    var show = compute();

    if(show) {
      if(!inDom) {
        if(parent !== ref.parentNode) {
          parent = ref.parentNode;
        }

        parent.insertBefore(el, ref);
      }
    } else {
      if(inDom) {
        ref = el.nextSibling;
        parent = el.parentNode;
        parent.removeChild(el);
      }
    }
  };

  this._register(new Binding(function(){
    compute.bind("change", position);
  }, function(){
    compute.unbind("change", position);
  }));

  position();
};

Bind.prototype.list = function(observable, templateSelector, hostSelector, callback){
  var t = this._getElement(templateSelector);
  var parent = this._getElement(hostSelector);
  var keys = {};
  var el = this.el;

  observable.subscribe(function(list){
    list.forEach(function(item, i){
      var clone = document.importNode(t.content, true);
      var bindings = new Bind(el, clone);
      callback.call(el, clone, item, i);
      parent.appendChild(clone);
    });
  });
};

if(typeof module !== "undefined" && module.exports) {
  module.exports = Bram;
} else {
  window.Bram = Bram;
}
