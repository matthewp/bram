module.exports = parse;

function parse(token, parser) {
  var nextToken = parser.peek();
  var node;
  if(!parser.inPipe && token.type === 'name' &&
     nextToken && nextToken.type === 'pipeline') {
    parser.inPipe = true;
    node = {
      type: 'PipelineExpression',
      params: [parser.walk()]
    };
    var val = walk();
    parser.inPipe = false;
    return val;
  }

  return node;

  function walk() {
    var token = parser.currentToken();
    var next = parser.peek();
    if(token && token.type === 'pipeline') {
      parser.increment();
      node.params.push(parser.walk());
      return walk();
    } else {
      return node;
    }
  }
}
