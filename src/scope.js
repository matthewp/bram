import { isModel, toModel } from './model.js';
import Transaction from './transaction.js';

function Scope(model, parent) {
  this.model = model;
  this.parent = parent;
}

Scope.prototype.read = function(prop){
  return this._read(prop) || {
    model: this.model,
    value: undefined
  };
};

Scope.prototype.readInTransaction = function(prop) {
  var transaction = new Transaction();
  transaction.start();
  var info = this.read(prop);
  info.reads = transaction.stop();
  return info;
};

Scope.prototype._read = function(prop){
  var model = this.model;
  var val = model[prop];
  if(val == null) {
    // Handle dotted bindings like "user.name"
    var parts = prop.split(".");
    if(parts.length > 1) {
      do {
        val = model[parts.shift()];
        if(parts.length) {
          model = val;
        }
      } while(parts.length && val);
    }
  }
  if(val != null) {
    return {
      model: model,
      value: val
    };
  }
  if(this.parent) {
    return this.parent.read(prop);
  }
}

Scope.prototype.add = function(object){
  var model;
  if(isModel(object)) {
    model = object;
  } else {
    var type = typeof object;
    if(Array.isArray(object) || type === "object") {
      model = toModel(object);
    } else {
      model = object;
    }
  }

  return new Scope(model, this);
};

export default Scope;
