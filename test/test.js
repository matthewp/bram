var Bram = require("../src/index");

var input = '4 + 4 - 3';

var output = Bram.compile(input);

var code = 'return ' + output;

console.log(code);

var fn = new Function('add', 'subtract', code);


console.log(
  fn(add, subtract)
);

function add(a, b){
  return a + b;
}

function subtract(a, b){
  return a - b;
}
