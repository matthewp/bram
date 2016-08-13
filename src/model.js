function observe(o, fn) {
  return new Proxy(o, {
    set(target, property, value) {
      target[property] = value;
      fn({
        prop: property,
        type: 'set'
      }, value);
      return true;
    },
  })
}

var events = Symbol('bram-events');

Bram.model = function(o){
  o = Object.keys(o).reduce(function(acc, prop){
    var val = o[prop];
    acc[prop] = (Array.isArray(val) || typeof val === "string")
      ? Bram.model(val)
      : val;
    return acc;
  }, Array.isArray(o) ? [] : {});

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
