import Bram, { createInstance } from '../src/bram.js';
import * as helpers from './helpers.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <template id="testerTemplate">
    <div id="tester" .foo="{{foo}}"></div>
  </template>

  <div id="host"></div>
`;

let model;

QUnit.module('.prop syntax', hooks => {
  hooks.beforeEach(() => {
    helpers.insert(template);

    let instance = createInstance(testerTemplate, {
      foo: 'bar'
    });
    host.append(instance.fragment);
    model = instance.model;
  });

  hooks.afterEach(helpers.clear);

  QUnit.test('props are set using .prop notation', assert => {
    assert.equal(tester.foo, 'bar', 'was set');
  });
  
  QUnit.test('prop is not included in the resulting fragment', assert=> {
    let val = tester.getAttribute(':foo');
    assert.ok(!val);
  });

  QUnit.module('live-bound', {
    after() {
      model.foo = 'bar';
    }
  });

  QUnit.test('works', assert => {
    model.foo = 'qux';
    assert.equal(tester.foo, 'qux');
  });
});
