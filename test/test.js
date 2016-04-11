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
    var expected = 'var addFive = function(a) {\n' +
      'return 5 + a;\n};';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled to a function');
  });

  it('works for functions without parameters', function(){
    var input = 'doStuff =\n 2';
    var expected = 'var doStuff = function() {\n' +
      'return 2;\n' +
      '};';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Did its thing');
  });

  it('works with multi line functions', function(){
    var input = 'addFive a =\n' +
      ' b = 5 + a\n' +
      ' b';
    var expected = 'var addFive = function(a) {\n' +
      'var b = 5 + a;\n' +
      'return b;\n' +
      '};';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled a complex function');
  });

  it('works with math where value comes first', function(){
    var input = 'addTwo a = a + 2';
    var expected = 'var addTwo = function(a) {\n' +
      'return a + 2;\n' +
      '};';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled correctly');
  });
});

describe('Call expressions', function(){
  it('work', function(){
    var input = 'addTwo 1\naddOne 3';
    var expected = 'addTwo(1);\naddOne(3);';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled correctly');
  });

  it('can assign value by calling a function', function(){
    var input = 'three = addTwo 1';
    var expected = 'var three = addTwo(1);';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled correctly');
  });

  it('can be called inside another function', function(){
    var input = 'addOne n = 1 + n\n' +
      'addTwo n =\n' +
      ' a = addOne n\n' +
      ' b = addOne n\n' +
      ' b + a\n' +
      'five = addTwo 3';
    var expected = 'var addOne = function(n) {\n' +
      'return 1 + n;\n' +
      '};\n' +
      'var addTwo = function(n) {\n' +
      'var a = addOne(n);\n' +
      'var b = addOne(n);\n' +
      'return b + a;\n' +
      '};\n' +
      'var five = addTwo(3);';

    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled correctly');
  });
});

describe('Strings', function(){
  it('basics works', function(){
    var input = 'a = "dog"';
    var expected = 'var a = "dog";';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'It worked');
  });

  it('escapes work', function(){
    var input = 'a = "\\\"dog\\\""';
    var expected = 'var a = "\\"dog\\"";';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'It worked');
  });

  it('multiline', function(){
    var input = 'a = "hello\n' +
      'world"';
    var expected = 'var a = "hello\nworld";';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Multiline works');
  });

  it('triple quotes', function(){
    var input = 'a = """hello\n' +
      '"world""""';
    var expected = 'var a = "hello\n\"world\"";';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Triple quotes works');
  });
});
