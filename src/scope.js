function Scope(model, parent) {
  this.model = model;
  this.parent = parent;
}

Scope.prototype.read = function(prop){
  var val = this.model[prop];
  if(val) {
    return {
      model: this.model,
      value: val
    };
  }
  if(this.parent) {
    return this.parent.read(prop);
  }
}

Scope.prototype.add = function(object){
  var model = Bram.isModel(object) ? object : Bram.model(object);
  return new Scope(model, this);
};
