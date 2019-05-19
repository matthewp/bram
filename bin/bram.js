const meow = require('meow');

const cli = meow(`
  Usage
    $ bram compile <input>

  Options
    --version   The package version
    --help      This help message
`);

const command = cli.input[0];
const input = cli.input[1] || '.';

if(!command) {
  cli.showHelp();
}

if(command !== 'compile') {
  console.error(`The command [${command}] is not supported.`);
  cli.showHelp();
}

const fsc = require('fs-cheerio');
const fs = require('fs');
const indentString = require('indent-string');
const { promisify } = require('util');
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);
const stripIndent = require('strip-indent');

// Taken from https://github.com/lukeed/rewrite-imports/blob/master/src/index.js
const UNNAMED = /(^|;|\s+)import\s*['"]([^'"]+)['"](?=($|;|\s))/gi;
const NAMED = /(^|[;\s]+)?import\s*(\*\s*as)?\s*(\w*?)\s*,?\s*(?:\{([\s\S]*?)\})?\s*from\s*['"]([^'"]+)['"];?/gi;

function spliceSlice(str, index, count, add) {
  // We cannot pass negative indexes directly to the 2nd slicing operation.
  if (index < 0) {
    index = str.length + index;
    if (index < 0) {
      index = 0;
    }
  }

  return str.slice(0, index) + (add || "") + str.slice(index + count);
}

async function compile(pth) {
  let $ = await fsc.readFile(pth);
  let modules = $('script[type="module"]');

  if(modules.length > 1) {
    console.error('Currently we only support 1 module script per HTML module file.');
    process.exit(1);
  }

  let javaScript = '';

  modules.each((i, el) => {
    let script = $(el);
    if(script.attr('src')) {
      console.error('Currently we do not support external module scripts');
      process.exit(1);
    }

    javaScript += stripIndent(script.html()).trim();
  });

  modules.remove();

  $('body').html($('head').html());
  let html = $('body').html().trim();
  
  const documentInsert = stripIndent(`
    import.meta.document = document.implementation.createHTMLDocument();
    import.meta.document.body.innerHTML = \`
${indentString(html, 6)}
    \`;
  `);

  let index = 0;
  for(let exp of [NAMED, UNNAMED]) {
    let r;
    exp.lastIndex = 0;

    while(r = (exp.exec(javaScript))) {
      let newIndex = r.index + r[0].length;
      if(newIndex > index) {
        index = newIndex;
      }
    }
  }

  let finalModule = spliceSlice(javaScript, index, 0, '\n' + documentInsert);
  return finalModule;
}

async function compileAndWrite(pth) {
  let source = await compile(pth);
  let outPth = pth + '.js';
  await writeFile(outPth, source, 'utf8');
}

async function run() {
  let stats = await stat(input);

  if(stats.isDirectory()) {
    console.error('Bram does not currently support compiling entire directories.');
    process.exit(1);
  } else {
    compileAndWrite(input);
  }
}

run();