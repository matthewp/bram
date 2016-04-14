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

    if (method) {
      method(node, parent);
    }

    switch (node.type) {
      case 'Program':
      case 'Binding':
      case 'FunctionBinding':
        traverseArray(node.body, node);
        break;

      case 'CallExpression':
        traverseArray(node.params, node);
        break;

      case 'ReturnStatement':
        traverseNode(node.expression, node);

      case 'Value':
      case 'MathLiteral':
      case 'MathExpression':
      case 'ConcatenationExpression':
      case 'NumberLiteral':
      case 'StringLiteral':
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
    Binding: function(node, parent) {
      var expression = {
        type: 'Binding',
        value: node.value,
        body: []
      };

      node._context = expression.body;
      parent._context.push(expression);
    },

    FunctionBinding: function(node, parent){
      var expression = {
        type: 'FunctionBinding',
        value: node.value,
        params: node.params,
        body: []
      };

      node.body.push({
        type: 'ReturnStatement',
        expression: node.body.pop()
      });

      node._context = expression.body;
      parent._context.push(expression);
    },

    NumberLiteral: function(node, parent) {
      parent._context.push({
        type: 'NumberLiteral',
        value: node.value
      });
    },

    StringLiteral: function(node, parent) {
      parent._context.push({
        type: 'StringLiteral',
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

    Value: function(node, parent) {
      parent._context.push({
        type: 'Value',
        name: node.name
      });
    },

    ReturnStatement: function(node, parent) {
      var ret = {
        type: 'ReturnStatement',
        params: []
      };
      node._context = ret.params;
      parent._context.push(ret);
    }
  });

  return newAst;
}

function notImplemented(type){
  var msg = 'Transformer does not yet support ' + type;
  throw new TypeError(msg);
}

function last(arr) {
  return arr[arr.length - 1];
}
