var compiler = require("./compiler");

module.exports = function(input){
  var output = compiler(input);
  var fn = new Function(output);
  return fn();
};
