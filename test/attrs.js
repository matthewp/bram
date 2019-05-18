import { createInstance } from '../src/bram.js';
import * as helpers from './helpers.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <template id="attrsTemplate">
    <a href="/{{foo}}/and/{{bar}}">Hello world</a>
  </template>
  <div id="host"></div>
`;

let anchor;

QUnit.module('Attributes', {
  beforeEach() {
    helpers.insert(template);
    let instance = createInstance(attrsTemplate, {
      foo: 'baz',
      bar: 'qux'
    });

    host.appendChild(instance.fragment);
    anchor = host.querySelector('a');
  },
  afterEach: helpers.clear
});

QUnit.test('Parses both values', assert => {
  assert.equal(anchor.getAttribute('href'), '/baz/and/qux');
});