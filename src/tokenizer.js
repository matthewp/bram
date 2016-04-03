module.exports = tokenizer;

var types = {

};

[
  '+', '-', '*', '/', '%', '^'
].forEach(function(token){
  types[token] = { type: 'math' };
});

function tokenizer(input) {
  var current = 0;
  var tokens = [];

  while (current < input.length) {
    var char = input[current];

    var desc = types[char];
    if(desc) {
      tokens.push({
        type: desc.type,
        value: char
      });
      current++;
      continue;
    }

    if (char === '(') {
      tokens.push({
        type: 'paren',
        value: '('
      });
      current++;
      continue;
    }

    if (char === ')') {
      tokens.push({
        type: 'paren',
        value: ')'
      });
      current++;
      continue;
    }

    var WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    var NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      var value = '';

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'number',
        value: value
      });

      continue;
    }

    var LETTERS = /[a-zA-Z]/;
    if (LETTERS.test(char)) {
      var value = '';

      while (char && LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'name',
        value: value
      });

      continue;
    }

    var LINEBREAK = /\n/;
    if(LINEBREAK.test(char)) {
      current++;

      tokens.push({
        type: 'linebreak'
      });
    }

    if(char === '=') {
      current++;
      tokens.push({
        type: 'assignment',
        value: char
      });

      continue;
    }

    throw new TypeError('I dont know what this character is: ' + char);
  }

  return tokens;
}
