const highlight = require('highlight.js');

module.exports = highlight$;

function highlight$($) {
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
    if($el.hasClass('lang-shell')) {
      $el.removeClass('lang-shell')
        .addClass('bash')
        .addClass('hljs');

      var outCode = highlight.highlight('bash', $el.text()).value;
      $el.html(outCode);
    }
  });
}
