var symbol = typeof Symbol === 'function' ? Symbol :
  function(str){ return '@@-' + str; };

var values = Object.values || function(obj){
  return Object.keys(obj).reduce(function(acc, key){
    acc.push(obj[key]);
    return acc;
  }, []);
};

var asap = typeof Promise === 'object' ? cb => Promise.resolve().then(cb) : cb => setTimeout(_ => cb(), 0);

var forEach = Array.prototype.forEach;
var some = Array.prototype.some;
var slice = Array.prototype.slice;

export {
  asap,
  symbol,
  values,
  forEach,
  some,
  slice
}
