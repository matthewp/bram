module.exports = codeGenerator;

function codeGenerator(node) {
  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator)
        .join('\n');

    case 'ExpressionStatement':
      return (
        codeGenerator(node.expression) +
        ';'
      );

    case 'CallExpression':
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator)
          .join(', ') +
        ')'
      );

    case 'MathExpression':
      debugger;
      return (
        node.params.map(codeGenerator).join(' ')
      );

    case 'Identifier':
      return node.name;

    case 'MathLiteral':
    case 'NumberLiteral':
      return node.value;

    default:
      notImplemented(node.type);
  }
}

function notImplemented(type){
  throw new TypeError(type + ' is not yet implemented in the code generator');
}
