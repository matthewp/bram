var tokenizer = require("./tokenizer");
var parser = require("./parser");
var transformer = require("./transformer");
var codeGenerator = require("./codegen");

module.exports = compiler;

function compiler(input) {
  var tokens = tokenizer(input);
  var ast    = parser(tokens);
  var newAst = transformer(ast);
  var output = codeGenerator(newAst);

  return output;
}
