var parse = require("../src/grammar").parse;

var ast = parse("import");

console.log("RESULT:", ast);
