var argv = process.argv.slice(2);
var parse = require("./grammar").parse;

var stdin = process.stdin;

stdin.setEncoding("utf8");
stdin.on("data", function(code){
  code = code.trim();
  console.log(parse(code));
});
