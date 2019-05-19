
function isArrayOrObject(object) {
  return Array.isArray(object) || typeof object === 'object';
}

function observe(o, fn) {
  let proxy = new Proxy(o, {
    get: function(target, property) {
      if(property === isModel) {
        return true;
      }
      return Reflect.get(target, property);
    },
    set: function(target, property, value) {
      var oldValue = target[property];
      if(!isModel(value) && isArrayOrObject(value)) {
        value = toModel(value, fn);
      }
      Reflect.set(target, property, value);

      // If the value hasn't changed, nothing else to do
      if(value === oldValue)
        return true;

      fn();
      return true;
    },
    deleteProperty: function(target, property){
      fn();
      return true;
    }
  });
  return proxy;
}

const events = Symbol('Bram.events');
const model = Symbol('bram.isModel');

function toModel(o, cb){
  if(!o[events]) {
    o = deepModel(o, cb) || {};

    Object.defineProperty(o, events, {
      value: {},
      enumerable: false
    });
  }

  return observe(o, cb);
}

function deepModel(o, cb) {
  return !o ? o : Object.keys(o).reduce(function(acc, prop){
    var val = o[prop];
    acc[prop] = (Array.isArray(val) || (typeof val === 'object' && val != null))
      ? toModel(val, cb)
      : val;
    return acc;
  }, o);
}

function isModel (object){
  return object && !!object[model];
}

export {
  isModel,
  toModel
};
