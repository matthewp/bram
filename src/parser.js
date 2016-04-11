module.exports = parser;

function parser(tokens) {
  var current = 0;
  var inMathExpression = false;
  var inCallExpression = false;
  var currentIndent = 0;

  function increment(){
    return tokens[++current];
  }

  function peek(){
    var token = tokens[current + 1];
    return token || {};
  }

  function walk() {
    var token = tokens[current];
    var nextToken = peek();

    if(token.type === 'number' || token.type === 'name') {
      var node = walkMathExpression();
      if(node) {
        return node;
      }
    }

    if(token.type === 'name') {
      var node = walkCallExpression();
      if(node) {
        return node;
      }
    }

    function walkMathExpression(){
      if(!inMathExpression && isPartOfMathExpression(nextToken, token)) {
        inMathExpression = true;
        var node = {
          type: 'MathExpression',
          params: [walk()]
        };

        token = tokens[current];

        var last = token;
        while(token && isPartOfMathExpression(token, last)) {
          last = token;
          node.params.push(walk());
          token = tokens[current];
        }
        inMathExpression = false;
        return node;
      }
    }

    function walkCallExpression(){
      var nextType = nextToken.type;
      if(!inCallExpression && (nextType === 'name' || nextType === 'number')) {
        var idx = current;
        var next = nextToken;
        while(next && next.type !== 'linebreak') {
          next = tokens[++idx];
          if(next && next.type === 'assignment') {
            return;
          }
        }

        inCallExpression = true;
        var node = {
          type: 'CallExpression',
          name: token.value,
          params: []
        };

        walk();
        token = tokens[current];

        var last = token;
        while(token && token.type !== 'linebreak') {
          last = token;
          node.params.push(walk());
          token = tokens[current];
        }
        inCallExpression = false;
        return node;
      }
    }

    if (token.type === 'number') {
      current++;

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

    if(token.type === 'assignment') {
      var node = {
        type: 'Assignment',
        value: token.value,
        expression: {
          params: []
        }
      };
      var last = token;

      token = increment();
      while(token.type === 'linebreak') {
        token = increment();
      }
      if(token.type === 'indent') {
        node.isFunction = true;
        walk();
        token = tokens[current];
      }

      function isValidContinuationToken(token) {
        var type = token && token.type;
        return type === 'assignment' || type === 'math';
      }

      function inAssignment(){
        if(!token) return false;
        if(token.type === 'linebreak') {
          var next = peek();
          if(!isValidContinuationToken(last)) {
            return false;
          }
          if(next.type === 'indent' && next.value === currentIndent) {
            walk();
            walk();
            return true;
          } else {
            return false;
          }
        }
        return true;
      }

      while(inAssignment()) {
        last = token;
        node.expression.params.push(walk());
        token = tokens[current];
      }

      return node;
    }

    if(token.type === 'name') {
      current++;

      return {
        type: 'Value',
        name: token.value
      };
    }

    if(token.type === 'linebreak') {
      current++;
      return;
    }

    if(token.type === 'indent') {
      current++;
      currentIndent = token.value;
      return;
    }

    notImplemented(token.type);
  }

  var ast = {
    type: 'Program',
    body: []
  };

  var node;
  while (current < tokens.length) {
    node = walk();
    if(node) {
      ast.body.push(node);
    }
  }

  return ast;
}

function isPartOfMathExpression(token, last){
  var type = token && token.type;
  var mathType = type === 'number' || type === 'math' || type === 'paren';
  if(last.type === 'name' && type !== 'math') {
    return false;
  }
  return mathType || last.type === 'math';
}

function isPartOfCallExpression(token, last){
  var type = token && token.type;
  return type === 'name';
}

function notImplemented(type){
  var msg = 'Parser does not support \'' + type + '\' yet.';
  throw new TypeError(msg);
}
