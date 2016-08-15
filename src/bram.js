var Bram = {};

var forEach = Array.prototype.forEach;
var some = Array.prototype.some;
var slice = Array.prototype.slice;

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

if(typeof module === "object" && module.exports) {
  module.exports = Bram;
} else {
  window.Bram = Bram;
}
