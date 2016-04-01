module.exports = parser;

function parser(tokens) {
  var current = 0;
  var inMathExpression = false;

  function walk() {
    var token = tokens[current];
    var nextToken;

    if (token.type === 'number') {
      current++;

      // Peek and see if the next is Math
      nextToken = tokens[current + 1];
      if(!inMathExpression && isPartOfMathExpression(nextToken)) {

        inMathExpression = true;
        var node = {
          type: 'MathExpression',
          params: [{
            type: 'NumberLiteral',
            value: token.value
          }]
        };

        token = tokens[current];

        while(token && isPartOfMathExpression(token)) {
          node.params.push(walk());
          token = tokens[current];
        }
        inMathExpression = false;
        return node;
      }

      return {
        type: 'NumberLiteral',
        value: token.value
      };
    }

    if(token.type === 'math') {
      current++;

      return {
        type: 'MathLiteral',
        value: token.value
      };
    }

    if (
      token.type === 'paren' &&
      token.value === '('
    ) {
      token = tokens[++current];

      var node = {
        type: 'CallExpression',
        name: token.value,
        params: []
      };

      token = tokens[++current];

      while (
        (token.type !== 'paren') ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        node.params.push(walk());
        token = tokens[current];
      }

      current++;

      return node;
    }

    throw new TypeError(token.type);
  }

  var ast = {
    type: 'Program',
    body: []
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

function isPartOfMathExpression(token){
  var type = token.type;
  return type === 'number' || type === 'math' || type === 'paren';
}

function notImplemented(type){
  var msg = 'Parser does not support ' + type + ' yet.';
  throw new TypeError(msg);
}
