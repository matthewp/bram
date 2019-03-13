import { on, off, isModel, toModel } from './model.js';
import { asap } from './util.js';
import createInstance from './instance';


function getTemplate(name) {
  return typeof name === 'string' ? document.querySelector(name) : name;
}

function Bram(Element) {
  return class extends Element {
    constructor() {
      super();

      // Initially an empty object
      const Element = this.constructor;
      this._instance = createInstance(getTemplate(Element.template), Object.create(this));
      this.model = this._instance.model;

      // TODO remove
      this._hasRendered = false;

      let events = Element.events;
      if(events && !Element._hasSetupEvents) {
        installEvents(Element);
      }

      let props = !Element._hasInstalledProps && Element.observedProperties;
      if(props) {
        Element._hasInstalledProps = true;
        installProps(Element, props, Element.observedAttributes);
      }
    }

    connectedCallback() {
      this._instance.update();
      if(this._instance && !this._hasRendered) {
        let renderMode = this.constructor.renderMode;
        if(renderMode === 'light') {
          this.innerHTML = '';
          this.appendChild(this._instance.fragment);
        } else {
          this.attachShadow({ mode: 'open' });
          this.shadowRoot.appendChild(this._instance.fragment);
        }
        this._hasRendered = true;
      } else if(this._hasRendered) {
        //this._link.attach();
      }
      if(this.childrenConnectedCallback) {
        this._disconnectChildMO = setupChildMO(this);
      }
    }

    disconnectedCallback() {
      if(this._disconnectChildMO) {
        this._disconnectChildMO();
      }
      if(this._link) {
        this._link.detach();
      }
    }

    attributeChangedCallback(name, oldVal, newVal) {
      var sa = this.constructor._syncedAttrs;
      var synced = sa && sa[name];
      if(synced && this[name] !== newVal) {
        this[name] = newVal;
      }
    }
  }
}

const Element = Bram(HTMLElement);
Bram.Element = Element;
Bram.model = toModel;
Bram.on = on;
Bram.off = off;
Bram.createInstance = createInstance;

function installEvents(Element) {
  Element._hasSetupEvents = true;
  Element.events.forEach(function(eventName){
    Object.defineProperty(Element.prototype, 'on' + eventName, {
      get: function(){
        return this['_on' + eventName];
      },
      set: function(fn){
        var prop = '_on' + eventName;
        var cur = this[prop];
        if(cur) {
          this.removeEventListener(eventName, cur);
        }
        this[prop] = fn;
        this.addEventListener(eventName, fn);
      }
    });
  });
}

function installProps(Element, props, attributes = []) {
  Element._syncedAttrs = {};
  var proto = Element.prototype;
  props.forEach(function(prop){
    var desc = Object.getOwnPropertyDescriptor(proto, prop);
    if(!desc) {
      var hasAttr = attributes.indexOf(prop) !== -1;
      if(hasAttr) {
        Element._syncedAttrs[prop] = true;
      }
      Object.defineProperty(proto, prop, {
        get: function() {
          return this.model[prop];
        },
        set: function(val) {
          this.model[prop] = val;
          if(hasAttr) {
            var cur = this.getAttribute(prop);
            if(typeof val === 'boolean') {
              if(val && cur !== '') {
                this.setAttribute(prop, '');
              } else if(cur === '' && !val) {
                this.removeAttribute(prop);
              }
              return;
            } else if(cur !== val) {
              this.setAttribute(prop, val);
            }
          }
        }
      });
    }
  });
}

function setupChildMO(inst) {
  var cancelled = false;
  var report = function(){
    if(!cancelled) {
      inst.childrenConnectedCallback();
    }
  };

  var mo = new MutationObserver(report);
  mo.observe(inst, { childList: true });

  if(inst.childNodes.length) {
    asap(report);
  }

  return function(){
    cancelled = true;
    mo.disconnect();
  };
}

export {
  Element,
  Bram,
  Bram as default
};
