var assert = require('assert');
var Bram = require("../src/index");

describe('Math', function(){

  it('can do it', function(){
    var input = '4 + 4 - 3';
    var output = Bram.compile(input);
    var code = 'return ' + output;
    var fn = new Function(code);

    assert.equal(fn(), 5, 'Correctly calculated');
  });
});
