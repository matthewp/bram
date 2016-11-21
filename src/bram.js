import { on, off, isModel, toModel } from './model.js';
import Scope from './scope.js';
import stamp from './stamp.js';
import { asap } from './util.js';

function Bram(Element) {
  return class extends Element {
    constructor() {
      super();

      var Element = this.constructor;
      let tmpl = Element.template;
      if(tmpl) {
        this._hydrate = stamp(tmpl);
      }
      this._hasRendered = false;

      // Initially an empty object
      this.model = {};

      let events = Element.events;
      if(events && !Element._hasSetupEvents) {
        installEvents(Element);
      }
    }

    connectedCallback() {
      if(this._hydrate && !this._hasRendered) {
        if(!isModel(this.model)) {
          this.model = toModel(this.model);
        }

        var scope = new Scope(this).add(this.model);
        var tree = this._hydrate(scope);
        var renderMode = this.constructor.renderMode;
        if(renderMode === 'light') {
          this.appendChild(tree);
        } else {
          this.attachShadow({ mode: 'open' });
          this.shadowRoot.appendChild(tree);
        }
      }
      if(this.childrenConnectedCallback) {
        this._disconnectChildMO = setupChildMO(this);
      }
    }

    disconnectedCallback() {
      if(this._disconnectChildMO) {
        this._disconnectChildMO();
      }
    }
  }
}

var Element = Bram(HTMLElement);
Bram.Element = Element;
Bram.model = toModel;
Bram.on = on;
Bram.off = off;
Bram.template = stamp;

function installEvents(Element) {
  Element._hasSetupEvents = true;
  Element.events().forEach(function(eventName){
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

var SUPPORTS_MO = typeof MutationObserver === 'function';

function setupChildMO(inst) {
  var cancelled = false;
  var report = function(){
    if(!cancelled) {
      inst.childrenConnectedCallback();
    }
  };

  if(!SUPPORTS_MO) {
    asap(report);
    return;
  }

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
  Bram as default
};
