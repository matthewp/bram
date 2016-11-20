var symbol = typeof Symbol === 'function' ? Symbol :
  function(str){ return '@@-' + str; };

var values = Object.values || function(obj){
  return Object.keys(obj).reduce(function(acc, key){
    acc.push(obj[key]);
    return acc;
  }, []);
};

var forEach = Array.prototype.forEach;
var some = Array.prototype.some;
var slice = Array.prototype.slice;

export {
  symbol,
  values,
  forEach,
  some,
  slice
}
