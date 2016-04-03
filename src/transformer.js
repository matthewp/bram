module.exports = transformer;

var slice = Array.prototype.slice;

function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(function(child) {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    var method = visitor[node.type];

    if(node.type === 'Assignment') {
      debugger;
    }

    if (method) {
      method(node, parent);
    }

    switch (node.type) {
      case 'Program':
        traverseArray(node.body, node);
        break;

      case 'CallExpression':
        traverseArray(node.params, node);
        break;

      case 'Assignment':
        traverseArray(node.expression.params, node);
        break;

      case 'Value':
      case 'MathLiteral':
      case 'MathExpression':
      case 'NumberLiteral':
        break;

      default:
        notImplemented(node.type);
    }
  }

  traverseNode(ast, null);
}

function transformer(ast) {
  var newAst = {
    type: 'Program',
    body: []
  };

  ast._context = newAst.body;

  traverser(ast, {
    NumberLiteral: function(node, parent) {
      parent._context.push({
        type: 'NumberLiteral',
        value: node.value
      });
    },

    MathLiteral: function(node, parent){
      parent._context.push({
        type: 'MathLiteral',
        value: node.value
      });
    },

    MathExpression: function(node, parent){
      parent._context.push({
        type: 'MathExpression',
        params: slice.call(node.params)
      });
    },

    CallExpression: function(node, parent) {
      var expression = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: node.name
        },
        arguments: []
      };

      node._context = expression.arguments;

      if (parent.type !== 'CallExpression') {
        expression = {
          type: 'ExpressionStatement',
          expression: expression
        };
      }

      parent._context.push(expression);
    },

    Assignment: function(node, parent) {
      var value = parent._context.pop();
      var expression = {
        type: 'Assignment',
        value: value,
        expression: {
          type: 'AssignmentExpression',
          params: []
        }
      };

      node._context = expression.expression.params;

      parent._context.push(expression);
    },

    Value: function(node, parent) {
      parent._context.push({
        type: 'Value',
        name: node.name
      });
    }
  });

  return newAst;
}

function notImplemented(type){
  var msg = 'Transformer does not yet support ' + type;
  throw new TypeError(msg);
}
