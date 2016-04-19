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
    var input = 'let a = 1';
    var output = Bram.compile(input);

    assert.equal(output, 'var a = 1;', 'Correctly transpiled');
  });

  it('can assign the result of a math expression', function(){
    var input = 'let a = 1 * 2';
    var output = Bram.compile(input);

    assert.equal(output, 'var a = 1 * 2;', 'Correctly transpiled');
  });

  it('can do multi-line assignments', function(){
    var input = 'let a =\n' +
      ' 1 + 1';
    var output = Bram.compile(input);

    assert.equal(output, 'var a = 1 + 1;', 'Transpiled multiline');
  });
});

describe('Assigning functions', function(){
  it('works', function(){
    var input = 'let addFive a = 5 + a';
    var expected = 'var addFive = function(a) {\n' +
      'return 5 + a;\n};';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled to a function');
  });

  it('works with multi line functions', function(){
    var input = 'let addFive a =\n' +
      ' let b = 5 + a\n' +
      ' b';
    var expected = 'var addFive = function(a) {\n' +
      'var b = 5 + a;\n' +
      'return b;\n' +
      '};';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled a complex function');
  });

  it('works with math where value comes first', function(){
    var input = 'let addTwo a = a + 2';
    var expected = 'var addTwo = function(a) {\n' +
      'return a + 2;\n' +
      '};';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled correctly');
  });

  it('works for nested functions', function(){
    var input = 'let addTwo n =\n' +
      ' let addOne a = 1 + a\n' +
      ' let b = addOne n\n' +
      ' let c = addOne n\n' +
      ' b + c';
    var expected = 'var addTwo = function(n) {\n' +
      'var addOne = function(a) {\n' +
      'return 1 + a;\n' +
      '};\n' +
      'var b = addOne(n);\n' +
      'var c = addOne(n);\n' +
      'return b + c;\n' +
      '};';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Able to handle nested functions');
  });

  it('even more complex assignment', function(){
    var input = 'let foo a = a\n' +
      'let bar a b =\n' +
      ' let qux a =\n' +
      '  let b = foo a\n' +
      '  b\n';
    var expected = 'var foo = function(a) {\n' +
      'return a;\n' +
      '};\n' +
      'var bar = function(a, b) {\n' +
      'var qux = function(a) {\n' +
      'var b = foo(a);\n' +
      'return b;\n' +
      '};\n' +
      'return qux;\n' +
      '};';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Compiled a complex assignment');
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
    var input = 'let three = addTwo 1';
    var expected = 'var three = addTwo(1);';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Transpiled correctly');
  });

  it('can be called inside another function', function(){
    var input = 'let addOne n = 1 + n\n' +
      'let addTwo n =\n' +
      ' let a = addOne n\n' +
      ' let b = addOne n\n' +
      ' b + a\n' +
      'let five = addTwo 3';
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

  it('works with strings', function(){
    var input = 'let two = addStuff "f"';
    var expected = 'var two = addStuff("f");';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'can call strings');
  });
});

describe('Strings', function(){
  it('basics works', function(){
    var input = 'let a = "dog"';
    var expected = 'var a = "dog";';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'It worked');
  });

  it('escapes work', function(){
    var input = 'let a = "\\\"dog\\\""';
    var expected = 'var a = "\\"dog\\"";';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'It worked');
  });

  it('multiline', function(){
    var input = 'let a = "hello\n' +
      'world"';
    var expected = 'var a = "hello\\nworld";';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Multiline works');
  });

  it('triple quotes', function(){
    var input = 'let a = """hello\n' +
      '"world""""';
    var expected = 'var a = "hello\\n\"world\"";';
    var output = Bram.compile(input);

    assert.equal(output, expected, 'Triple quotes works');
  });

  describe('Concatenation', function(){
    it('two strings', function(){
      var input = 'let a = "b" + "c"';
      var expected = 'var a = "b" + "c";';
      var output = Bram.compile(input);

      assert.equal(output, expected, 'two strings works');
    });

    it('values and strings', function(){
      var input = 'let a = b + "c"';
      var expected = 'var a = b + "c";';
      var output = Bram.compile(input);

      assert.equal(output, expected, 'mixed strings and values works');
    });

  });
});
