const marked = require('marked');
const fs = require('fs');
const cheerio = require('cheerio');
const highlight = require('highlight.js');

function link() {
  return `<svg aria-hidden="true" class="link-link" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>`
}

function getAPI() {
  let pth = `${__dirname}/../../README.md`;
  let src = fs.readFileSync(pth, 'utf8');

  let res = marked(src);
  let $ = cheerio.load(`<body>${res}</body>`);

  let inAPI = false;
  $('body').children().each((idx, el) => {
    let $el = $(el);
    if(!inAPI) {
      if(el.tagName === 'h2' && $el.attr('id') === 'api') {
        inAPI = true;
      } else {
        $el.remove();
      }
    } else {
      if(el.tagName === 'h2') {
        $el.remove();
        inAPI = false;
      }
    }
  });

  $('code').each((idx, el) => {
    let $el = $(el);
    if($el.hasClass('lang-js')) {
      $el.removeClass('lang-js')
        .addClass('javascript')
        .addClass('hljs');

      var outCode = highlight.highlight('javascript', $el.text()).value;
      $el.html(outCode);
    }
    if($el.hasClass('lang-html')) {
      $el.removeClass('lang-html')
        .addClass('html')
        .addClass('hljs')
        .addClass('html');
      var outCode = highlight.highlight('html', $el.text()).value;
      $el.html(outCode);
    }
  });

  $('h3, h4').each((idx, el) => {
    let $el = $(el);
    let anchor = $('<a>').attr('href', `#${$el.attr('id')}`)
      .text($el.text());
    anchor.html(link());

    $el.text(' ' + $el.text());
    $el.prepend(anchor);
  });

  return $('body').html();
}

function fillTemplate(str) {
  let pth = `${__dirname}/../template.html`;
  let src = fs.readFileSync(pth, 'utf8');

  let $ = cheerio.load(src);

  let styles = $('<link>')
    .attr('rel', 'stylesheet')
    .attr('href', './styles/api.css');
  $('head').append(styles);
  $('#main').replaceWith(str);
  return $.html();
}

let apiStr = getAPI();
let out = fillTemplate(apiStr).trim();
console.log(out);
