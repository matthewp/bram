var parsePipeline = require("./parser/pipeline");

module.exports = parser;

function parser(tokens) {
  var current = 0;
  var inMathExpression = false;
  var inCallExpression = false;
  var inConcatExpression = false;
  var currentIndent = 0;

  function increment(){
    return tokens[++current];
  }

  function decrement(){
    return tokens[--current];
  }

  function currentToken(){
    return tokens[current];
  }

  function peek(){
    var token = tokens[current + 1];
    return token || {};
  }

  var helpers = {
    increment: increment,
    decrement: decrement,
    currentToken: currentToken,
    peek: peek,
    tokens: tokens,
    walk: walk,
  };

  function walk() {
    var token = tokens[current];
    var nextToken = peek();

    if(token.type === 'name' && token.value === 'let') {
      token = increment();

      var node = {
        type: 'Binding',
        value: token.value,
        body: []
      };

      var params = [];
      token = increment();

      do {
        token = currentToken();
        if(token.type === 'assignment') {
          break;
        } else {
          params.push(walk());
        }
      } while(true);

      // A FunctionBinding
      if(params.length) {
        node.type = 'FunctionBinding';
        node.params = params;

        // Detect a unit function
        if(params[0].type === 'Paren' && params[1].type === 'Paren') {
          // TODO unmatched unit parens
          params.pop();
          params.pop();
        }
      }

      increment();
      var letIndent = currentIndent;

      // Now for the body
      do {
        token = currentToken();
        if(!token) break;
        if(token.type === 'linebreak') {
          token = increment();
          if(token && token.type === 'indent') {
            walk();

            // If indent has increased we are still within this assignment
            if(currentIndent > letIndent) {
              continue;
            }
          }
          break;
        } else {
          node.body.push(walk());
        }
      } while(true);

      return node;
    }

    if(token.type === 'number' || token.type === 'name') {
      var node = walkMathExpression();
      if(node) {
        return node;
      }
    }

    if(token.type === 'name' || token.type === 'string') {
      var node = walkCallExpression();
      if(node) {
        return node;
      }
    }

    var node = parsePipeline(token, helpers);
    if(node) {
      return node;
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
      if(!inCallExpression && (nextType === 'name' || nextType === 'number' ||
                              nextType === 'string')) {
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

    if(token.type === 'string') {
      current++;

      return {
        type: 'StringLiteral',
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

    if(token.type === 'paren') {
      current++;

      return {
        type: 'Paren',
        name: token.value
      };
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
  return type === 'name' || type === 'string';
}

function notImplemented(type){
  var msg = 'Parser does not support \'' + type + '\' yet.';
  throw new TypeError(msg);
}
