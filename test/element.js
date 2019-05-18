import { Element } from '../src/bram.js';
import * as helpers from './helpers.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <template id="someTemplate">
    <span>{{name}}</span>
  </template>
  <some-element id="someElement"></some-element>
`;

QUnit.module("Bram.element", {
  before() {
    helpers.insert(template);

    class SomeElement extends Element {
      constructor() {
        super();
        this.model = this.attachView(someTemplate);
        this.model.name = 'world';
      }
    }

    customElements.define('some-element', SomeElement);
  },
  after: helpers.clear
});

QUnit.test("Renders to shadowRoot", assert => {
  let root = someElement.shadowRoot;
  let txt = root.firstElementChild.textContent;

  assert.equal(txt, 'world');
});