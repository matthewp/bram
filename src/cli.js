var Bram = require('./index');

process.stdin.setEncoding('utf8');

compileFromStdIn(process.stdin);

function compileFromStdIn(stream) {
  var input = '';

  stream.on('data', function(data){
    input += data;
  });

  stream.on('end', function(){
    var output = Bram.compile(input);
    console.log(output);
  });
}
