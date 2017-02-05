const anchorify = require('./lib/anchorify');
const marked = require('marked');
const fs = require('fs');
const cheerio = require('cheerio');
const highlight = require('./lib/highlight');

function getGuide(name) {
  let pth = `${__dirname}/../doc/${name}.md`;
  let src = fs.readFileSync(pth, 'utf8');

  let res = marked(src);
  let $ = cheerio.load(`<body>${res}</body>`);

  highlight($);

  return $('body').html();
}

function fillTemplate(str) {
  let pth = `${__dirname}/../template.html`;
  let src = fs.readFileSync(pth, 'utf8');

  let $ = cheerio.load(src);

  let styles = $('<link>')
    .attr('rel', 'stylesheet')
    .attr('href', './styles/guide.css');
  $('head').append(styles);

  $('#main').replaceWith(str);
  return $.html();
}

let whichGuide = process.argv[2] || 'guide';
let apiStr = getGuide(whichGuide);
let out = fillTemplate(apiStr).trim();
console.log(out);
