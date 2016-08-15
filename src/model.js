function isArraySet(object, property){
  return Array.isArray(object) && !isNaN(+property);
}

function observe(o, fn) {
  return new Proxy(o, {
    set: function(target, property, value) {
      var oldValue = target[property];
      target[property] = value;

      // If the value hasn't changed, nothing else to do
      if(value === oldValue)
        return true;

      if(isArraySet(target, property)) {
        fn({
          prop: Bram.arrayChange,
          index: +property,
          type: 'set'
        }, value);
      } else {
        fn({
          prop: property,
          type: 'set'
        }, value)
      }

      return true;
    },
    deleteProperty: function(target, property, value){

    }
  })
}

var events = Symbol('bram-events');
Bram.arrayChange = Symbol('bram-array-change');

Bram.model = function(o){
  o = deepModel(o);

  var callback = function(ev, value){
    var fns = proxy[events][ev.prop];
    if(fns) {
      fns.forEach(function(fn){
        fn(ev, value);
      });
    }
  };

  var proxy = observe(o || {}, callback);

  Object.defineProperty(proxy, events, {
    value: {},
    enumerable: false
  });

  return proxy;
};

function deepModel(o) {
  return !o ? o : Object.keys(o).reduce(function(acc, prop){
    var val = o[prop];
    acc[prop] = (Array.isArray(val) || typeof val === "object")
      ? Bram.model(val)
      : val;
    return acc;
  }, Array.isArray(o) ? [] : {})
}

Bram.isModel = function(object){
  return object && !!object[events];
};

Bram.addEventListener = function(model, prop, callback){
  var evs = model[events];
  if(!evs) return;
  var ev = evs[prop];
  if(!ev) {
    ev = evs[prop] = [];
  }
  ev.push(callback);
};

Bram.off = function(model){
  model[events] = {};
};
