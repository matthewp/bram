function Scope(model, parent) {
  this.model = model;
  this.parent = parent;
}

Scope.prototype.read = function(prop){
  if(prop === 'item') {
    return {
      model: this.model,
      bindable: false
    };
  }
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
