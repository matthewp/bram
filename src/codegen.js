module.exports = codeGenerator;

function codeGenerator(node) {

  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator)
        .join('\n');

    case 'Binding':
      return addSemicolon(
        'var ' + node.value + ' = ' + node.body.map(codeGenerator).join(' ')
      );

    case 'FunctionBinding':
      var value = node.value;
      var body = node.body;
      var params = node.params.map(codeGenerator).join(', ');
      return (
        'var ' + value + ' = function(' + params + ') {\n' +
        body.map(codeGenerator).join('\n') + '\n};'
      );

    case 'ExpressionStatement':
      return addSemicolon(codeGenerator(node.expression));

    case 'CallExpression':
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator)
          .join(', ') +
        ')'
      );

    case 'MathExpression':
      return (
        node.params.map(codeGenerator).join(' ')
      );

    case 'ReturnStatement':
      return addSemicolon(
        'return ' + node.params.map(codeGenerator).join(' ')
      );

    case 'Value':
    case 'Identifier':
      return node.name;

    case 'MathLiteral':
    case 'NumberLiteral':
      return node.value;

    case 'StringLiteral':
      return '"' + node.value + '"';

    default:
      notImplemented(node.type);
  }
}

function addSemicolon(str){
  return str[str.length - 1] === ';' ? str : str + ';';
}

function notImplemented(type){
  throw new TypeError(type + ' is not yet implemented in the code generator');
}
