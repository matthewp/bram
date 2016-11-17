function Bram(Element) {
  return class extends Element {
    constructor() {
      super();

      let modelFn = new.target.model;
      this.model = Bram.model(modelFn ? modelFn() : {});

      let tmplFn = new.target.template;
      if(tmplFn) {
        this._hydrate = Bram.template(tmplFn());
      }
      this._hasRendered = false;
    }

    connectedCallback() {
      if(this._hydrate && !this._hasRendered) {
        let tree = this._hydrate(this.model);
        // TODO determine where to render
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(tree);
      }
    }
  }
}

Bram.Element = Bram(HTMLElement);

var forEach = Array.prototype.forEach;
var some = Array.prototype.some;
var slice = Array.prototype.slice;

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
