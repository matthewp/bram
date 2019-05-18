import { toModel } from './model.js';
import createInstance from './instance.js';

const instance = Symbol('Bram.instance');

function Bram(Element) {
  return class extends Element {
    attachView(template, model = {}) {
      if(instance in this) {
        throw new Error('Views cannot be created on a host which already contains a view.');
      }
      if(this.shadowRoot === null) {
        this.attachShadow({ mode: 'open' });
      }
      this[instance] = createInstance(template, model);
      this.shadowRoot.append(this[instance].fragment);
      return this[instance].model;
    }

    connectedCallback() {
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

const Element = Bram(HTMLElement);
Bram.Element = Element;

function setupChildMO(inst) {
  let cancelled = false;
  let report = () => {
    if(!cancelled) {
      inst.childrenConnectedCallback();
    }
  };
  let mo = new MutationObserver(report);
  mo.observe(inst, { childList: true });

  // If it has any children at all, go ahead and report
  if(inst.firstChild) {
    Promise.resolve().then(report);
  }

  return () => {
    cancelled = true;
    mo.disconnect();
  };
}

export {
  Element,
  Bram,
  Bram as default,

  toModel as model,
  createInstance
};
