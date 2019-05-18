import { createInstance } from '../src/bram.js';
import * as helpers from './helpers.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <template id="conditional"><template directive="if" expression="condition">{{val}}</template></template>

  <template id="conditional2">
    <template directive="if" expression="condition">
      <span id="ittrue">True!</span>
    </template>

    <section>
      <div class="two" .bar="{{foo}}">Stuff after</div>
    </section>
  </template>

  <div id="host"></div>
`;

QUnit.module('template[if]', hooks => {
  hooks.beforeEach(() => {
    helpers.insert(template);
  });

  hooks.afterEach(helpers.clear);

  let model;

  QUnit.module('rendering', {
    beforeEach() {
      let instance = createInstance(conditional, {
        val: 'Wilbur'
      });
      model = instance.model;
      host.append(instance.fragment);
    }
  });

  QUnit.test('shows value when truthy', assert => {
    model.condition = true;
    var val = host.firstChild.nextSibling

    assert.equal(val.nodeValue, 'Wilbur');
  });

  QUnit.test('empties itself when falsey', assert => {
    model.condition = true;
    model.condition = false;

    var val = host.firstChild.nextSibling;

    assert.equal(val, undefined, 'There is no val');
  });

  QUnit.test('reinserts itself when going back to truthy', assert => {
    model.condition = true;
    model.condition = false;
    model.condition = true;

    var val = host.firstChild.nextSibling;

    assert.equal(val.nodeValue, 'Wilbur');
  });

  QUnit.module('rendering next to other content', {
    beforeEach() {
      let instance = createInstance(conditional2, { bar: 'foo', condition: true });
      host.append(instance.fragment);
    }
  });

  QUnit.skip('doesn\'t affect adjacent content', assert => {
    console.log(host);
    let two = host.querySelector('.two');
    assert.equal(two.bar, 'foo');
  });
});
