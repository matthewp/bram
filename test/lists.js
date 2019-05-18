import * as Bram from '../src/bram.js';
import * as helpers from './helpers.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <template id="each"><template directive="foreach" expression="names">{{item}}</template></template>
  <div id="host"></div>
`;

QUnit.module('template[each]', hooks => {
  hooks.beforeEach(() => {
    helpers.insert(template);
  });
  hooks.afterEach(helpers.clear);

  const createInstance = model => Bram.createInstance(each, model);

  const first = () => host.firstChild.nextSibling.nextSibling;
  const second = () => first().nextSibling.nextSibling.nextSibling;
  const third = () => second().nextSibling.nextSibling.nextSibling;
  const fourth = () => third().nextSibling.nextSibling.nextSibling;

  let data;
  QUnit.module('Existing arrays works', {
    beforeEach() {
      let instance = createInstance({
        names: ['Matthew', 'Anne', 'Wilbur']
      });
      data = instance.model;
      host.append(instance.fragment);
    }
  });

  QUnit.test('All items added', assert => {
    assert.equal(first().data, 'Matthew');
    assert.equal(second().data, 'Anne');
    assert.equal(third().data, 'Wilbur');
  });

  QUnit.test('Can unshift an item to the front', assert => {
    data.names.unshift('French');

    assert.equal(first().data, 'French');
    assert.equal(second().data, 'Matthew');
    assert.equal(third().data, 'Anne');
    assert.equal(fourth().data, 'Wilbur');
  });

  QUnit.test('Can push an item on the end', assert => {
    data.names.push('French');

    assert.equal(first().data, 'Matthew');
    assert.equal(second().data, 'Anne');
    assert.equal(third().data, 'Wilbur');
    assert.equal(fourth().data, 'French');
  });

  QUnit.test('Can change the reference', assert => {
    data.names[0] = 'French';

    assert.equal(first().data, 'French');
    assert.equal(second().data, 'Anne');
    assert.equal(third().data, 'Wilbur');
  });

  QUnit.test('Can splice out items', assert => {
    data.names.splice(0, 1);
    assert.equal(first().data, 'Anne');
    assert.equal(second().data, 'Wilbur');

    data.names.splice(0, 1);
    assert.equal(first().data, 'Wilbur');

    data.names.splice(0, 1);

    {
      let first = host.firstChild.nextSibling;
      assert.equal(first, undefined);
    }
  });

  QUnit.test('can replace items with splice', assert => {
    data.names.splice(0, 0, 'French');

    assert.equal(first().data, 'French');
    assert.equal(second().data, 'Matthew');
  });

  QUnit.module('replacing a list', {
    beforeEach() {
      let instance = createInstance({
        names: ['Matthew', 'Anne', 'Wilbur']
      });
      data = instance.model;
      host.append(instance.fragment);
    }
  });

  QUnit.test('updates itself', assert => {
    data.names = ['Foo', 'Bar'];
    assert.equal(first().nodeValue, 'Foo');
    assert.equal(second().nodeValue, 'Bar');

    data.names.push('Baz');
    assert.equal(third().nodeValue, 'Baz');
  });
});



/*
describe('template[each]', function(){
  const createInstance = model => Bram.createInstance(each, model);

  const first = () => host.firstChild.nextSibling.nextSibling;
  const second = () => first().nextSibling.nextSibling.nextSibling;
  const third = () => second().nextSibling.nextSibling.nextSibling;
  const fourth = () => third().nextSibling.nextSibling.nextSibling;

  afterEach(function(){
    host.innerHTML = '';
  });




});
*/