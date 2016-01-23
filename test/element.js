QUnit.module('Bram.element with template', {
  beforeEach: function(){
    var template = document.createElement('template');
    var span = document.createElement('span');
    span.textContent = 'Hello world';
    template.content.appendChild(span);

    Bram.element({
      tag: 'bram-element',
      template: template
    });

    this.element = document.createElement('bram-element');
    this.shadow = this.element.shadowRoot;
  }
});

QUnit.test('Template renders correctly', function(assert){
  assert.equal(this.shadow.childNodes[0].tagName, 'SPAN', 'There is a span');
  assert.equal(this.shadow.childNodes[0].textContent, 'Hello world', 'With the correct content');
});
