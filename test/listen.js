QUnit.module('Bram.listen');

QUnit.test('Receives messages from Bram.trigger', function(assert){
  assert.expect(1);

  var messages = Bram.listen();

  var subscription = messages.subscribe(function(ev){
    assert.equal(ev.type, 'hello', 'Got the hello message');
    subscription.dispose();
  });

  var el = document.querySelector('#qunit-test-area');
  Bram.trigger(el, { type: 'hello' }, messages.eventName);
});
