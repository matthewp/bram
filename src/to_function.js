module.exports = toFunction;

function toFunction(src){
  return new Function(src);
}
