QUnit.module('Bram.Binding#text', {
  beforeEach: function(){
    this.element = document.createElement('span');
    this.binding = new Bram.Binding(this.element);
  }
});

QUnit.test('Binds an observable to text content', function(assert){
  var o = Rx.Observable.just('hello world');
  this.binding.text(o);

  assert.equal(this.element.textContent, 'hello world', 'Did bind');
});

QUnit.test('Returns the Binding', function(assert){
  var ret = this.binding.text(Rx.Observable.just('foo'));
  assert.equal(ret, this.binding, 'returned the Binding object');
});

QUnit.module('Bram.Binding#value', {
  beforeEach: function(){
    this.element = document.createElement('input');
    this.binding = new Bram.Binding(this.element);
  }
});

QUnit.test('Binds an observable to input value', function(assert){
  var o = Rx.Observable.just('hello world');
  this.binding.value(o);

  assert.equal(this.element.value, 'hello world', 'Did bind');
});

QUnit.test('Returns the Binding', function(assert){
  var ret = this.binding.value(Rx.Observable.just('foo'));
  assert.equal(ret, this.binding, 'returned the Binding object');
});

QUnit.module('Bram.Binding#attr', {
  beforeEach: function(){
    this.element = document.createElement('span');
    this.binding = new Bram.Binding(this.element);
  }
});

QUnit.test('Adds attribute values', function(assert){
  this.binding.attr('foo', Rx.Observable.just('bar'));
  assert.equal(this.element.getAttribute('foo'), 'bar', 'set the attribute');
});

QUnit.test('Returns the Binding', function(assert){
  var ret = this.binding.attr('foo', Rx.Observable.just('bar'));
  assert.equal(ret, this.binding, 'returned itself');
});

QUnit.module('Bram.Binding#condAttr', {
  beforeEach: function(){
    this.element = document.createElement('span');
    this.binding = new Bram.Binding(this.element);
  }
});

QUnit.test('Adds attribute values', function(assert){
  this.binding.condAttr('foo', Rx.Observable.just(true));
  assert.equal(this.element.getAttribute('foo'), '', 'set the attribute');
});

QUnit.test('Returns the Binding', function(assert){
  var ret = this.binding.condAttr('foo', Rx.Observable.just(true));
  assert.equal(ret, this.binding, 'returned itself');
});

QUnit.module('Bram.Binding#hideWhen', {
  beforeEach: function(){
    this.element = document.createElement('span');
    this.binding = new Bram.Binding(this.element);
  }
});

QUnit.test('Marks an element as display: none when truthy', function(assert){
  var o = Rx.Observable.just(true);
  this.binding.hideWhen(o);

  var display = this.element.style.display;
  assert.equal(display, 'none', 'Element is hidden');
});

QUnit.test('Restores an element\'s display when back to falsey', function(assert){
  var done = assert.async();

  var o = Rx.Observable.timer(5)
    .timeInterval()
    .startWith(false)
    .map(function(value){
      return !value;
    });
  this.binding.hideWhen(o);

  var display = this.element.style.display;
  assert.equal(display, 'none', 'Element is hidden');

  setTimeout(function(){
    display = this.element.style.display;
    assert.equal(display, '', 'Element is restored');
    done();
  }.bind(this), 10);
});

QUnit.test('Returns the Binding', function(assert){
  var ret = this.binding.hideWhen(Rx.Observable.just(true));

  assert.equal(ret, this.binding, 'Returned the binding object');
});

QUnit.module('Bram.Binding#when', {
  beforeEach: function(){
    document.querySelector('#qunit-test-area').innerHTML = '<template id="foo">' +
      '<span></span></template>';

    this.element = document.createElement('div');
    this.binding = new Bram.Binding(this.element, document.body);
  }
});

QUnit.test('Basics works', function(assert){
  assert.expect(3);

  var o = Rx.Observable.just(true);
  this.binding.when(o, '#foo', function(bind){
    assert.ok(typeof bind, 'Got a binding function');

    var o = Rx.Observable.just('hello world');
    bind('span').text(o);
  });

  assert.equal(this.element.childNodes.length, 1, 'got the span child');
  assert.equal(this.element.childNodes[0].textContent, 'hello world',
               'child was bound');
});

QUnit.test('Returns the Binding', function(assert){
  var o = Rx.Observable.just(true);
  var ret = this.binding.when(o, '#foo', function(){});

  assert.equal(ret, this.binding, 'Got the Binding back');
});

QUnit.module('Bram.Binding#list', {
  setup: function(){
    document.querySelector('#qunit-test-area').innerHTML =
      '<template id="person">' +
      '<li>' +
      '<span class="first"></span>' +
      '<span class="last"></span>' +
      '</li>' +
      '</template>';

    this.element = document.createElement('ul');
    this.binding = new Bram.Binding(this.element, document.body);
  }
});

QUnit.test('Binds to a list', function(assert){
  var people = Rx.Observable.just([
    { id: 1, first: 'Bram', last: 'Stoker' },
    { id: 2, first: 'Mary', last: 'Shelley' },
    { id: 3, first: 'Gaston', last: 'Leroux' }
  ]);

  this.binding.list(people, {
    template: '#person',
    key: 'id'
  }, function(el, person){
    el.querySelector('.first').textContent = person.first;
    el.querySelector('.last').textContent = person.last;
  });

  var el = this.element;
  assert.equal(el.childNodes.length, 3, 'There are 3 children');

  var first = el.querySelector('li .first');
  assert.equal(first.textContent, 'Bram', 'Got the right name');
});

QUnit.test('Returns the Binding', function(assert){
  var people = Rx.Observable.just([
    { id: 1, first: 'Bram', last: 'Stoker' },
    { id: 2, first: 'Mary', last: 'Shelley' },
    { id: 3, first: 'Gaston', last: 'Leroux' }
  ]);

  var ret = this.binding.list(people, {
    template: '#person',
    key: 'id'
  }, function(el, person){
    el.querySelector('.first').textContent = person.first;
    el.querySelector('.last').textContent = person.last;
  });

  assert.equal(ret, this.binding, 'Returning the binding object');
});
