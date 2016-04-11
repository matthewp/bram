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

    var LINEBREAK = /\n/;
    if(LINEBREAK.test(char)) {
      current++;

      tokens.push({
        type: 'linebreak'
      });

      char = input[current];
      var indent = 0;
      while(char === ' ') {
        indent++;
        char = input[++current];
      }

      if(indent) {
        tokens.push({
          type: 'indent',
          value: indent
        });
      }

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

    if(char === '"') {
      var inEscape = false;
      var isTripleQuote = false;
      var quoteCount = 0;
      var value = '';
      char = input[++current];

      if(char === '"' && input[current + 1] === '"') {
        isTripleQuote = true;
        char = input[++current];
        char = input[++current];
      }

      while(char !== '"' || isTripleQuote || inEscape) {
        value += char;
        inEscape = !inEscape && char === '\\';
        char = input[++current];

        if(isTripleQuote && char === '"' && !inEscape) {
          quoteCount++;

          if(quoteCount >= 3 && input[current + 1] !== '"') {
            value = value.substr(0, value.length - 2);
            break;
          }
        } else {
          quoteCount = 0;
        }
      }

      current++;

      tokens.push({
        type: 'string',
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
