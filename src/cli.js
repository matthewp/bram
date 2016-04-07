var Bram = require('./index');

compileFromStdIn(process.stdin);

function compileFromStdIn(stream) {
  var input = '';

  stream.setEncoding('utf8');
  stream.on('data', function(data){
    input += data;
  });

  stream.on('end', function(){
    var output = Bram.compile(input);
    console.log(output);
  });
}
