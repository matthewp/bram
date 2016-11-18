var ignoredProps = {
  _hydrate: true,
  _hasRendered: true
};

function Bram(Element) {
  return class extends Element {
    constructor() {
      super();

      let tmplFn = new.target.template;
      if(tmplFn) {
        this._hydrate = Bram.template(tmplFn());
      }
      this._hasRendered = false;

      let events = new.target.events;
      if(events && !new.target._hasSetupEvents) {
        installEvents(new.target);
      }
    }

    connectedCallback() {
      if(this._hydrate && !this._hasRendered) {
        this.model = Bram.model(this, true);
        var tree = this._hydrate(this.model);
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

Bram.Element = Bram(HTMLElement);

var forEach = Array.prototype.forEach;
var some = Array.prototype.some;
var slice = Array.prototype.slice;

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
