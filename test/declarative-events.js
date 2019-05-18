import Bram from '../src/bram.js';
import * as helpers from './helpers.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <template id="clickTemplate">
    <a href="#" @click="{{doSomething}}">Click me</a>
  </template>
  <click-element id="clickElement"></click-element>

  <div id="host"></div>
`;

QUnit.module('Declarative Events', {
  beforeEach() {
    helpers.insert(template);
  },
  afterEach: helpers.clear
});

QUnit.test('Handlers are set up and work', assert => {
  class ClickElement extends Bram.Element {
    constructor() {
      super();

      this.clicks = 0;
      this.attachView(clickTemplate, {
        doSomething: ev => {
          this.clicks++;
          ev.preventDefault();
        }
      });
    }
  }

  customElements.define('click-element', ClickElement);

  let clickElement = document.querySelector('click-element');
  let el = clickElement.shadowRoot.querySelector('a');
  el.dispatchEvent(new Event('click'));

  assert.equal(clickElement.clicks, 1);
});