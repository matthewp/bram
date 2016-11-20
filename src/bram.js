import { on, off, toModel } from './model.js';
import Scope from './scope.js';
import stamp from './stamp.js';

function Bram(Element) {
  return class extends Element {
    constructor() {
      super();

      var Element = this.constructor;
      let tmplFn = Element.template;
      if(tmplFn) {
        this._hydrate = stamp(tmplFn());
      }
      this._hasRendered = false;

      let model = Element.model;
      this.model = toModel(model ? model() : {});

      let events = Element.events;
      if(events && !Element._hasSetupEvents) {
        installEvents(Element);
      }
    }

    connectedCallback() {
      if(this._hydrate && !this._hasRendered) {
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

export {
  Element,
  Bram as default
};
