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

describe('Assignment', function(){
  it('can assign variables', function(){
    var input = 'a = 1';
    var output = Bram.compile(input);

    assert.equal(output, 'var a = 1;', 'Correctly transpiled');
  });

  it('can assign the result of a math expression', function(){
    var input = 'a = 1 * 2';
    var output = Bram.compile(input);

    assert.equal(output, 'var a = 1 * 2;', 'Correctly transpiled');
  });
});

describe('Assigning functions', function(){
  it('works', function(){
    var input = 'addFive a = 5 + a';
    var expected = 'var addFive = function(a) { return 5 + a; };';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled to a function');
  });

  it.skip('works with multi line functions', function(){
    var input = 'addFive a =\n' +
      ' b = 5 + a\n' +
      ' b';
    var expected = 'var addFive = function(a) {\n' +
      'var b = 5 + a;\n' +
      'return b;\n' +
      '};';
    var output = Bram.compile(input);

    console.log("OUT:", output)

    assert.equal(output, expected, 'Transpiled a complex function');
  });
});
