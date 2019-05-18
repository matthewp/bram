import Bram from '../src/bram.js';
import * as helpers from './helpers.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <foo-bar><div class="foobar">Foo bar</div></foo-bar>
  <div id="host"></div>
`;

QUnit.module('childrenConnectedCallback', hooks => {
  hooks.beforeEach(() => {
    helpers.insert(template);
  });
  hooks.afterEach(helpers.clear);

  QUnit.module('HTML upgrades');

  QUnit.test('Reports children', assert => {
    let done = assert.async();

    class FooBar extends Bram.Element {
      childrenConnectedCallback() {
        let children = this.childNodes;
        assert.equal(children.length, 1);
        assert.equal(children.item(0).className, 'foobar');
        done();
      }
    }
    customElements.define('foo-bar', FooBar);
  });

  function later(cb) {
    setTimeout(cb, 0);
  }

  QUnit.module('Dynamically created');

  QUnit.test('doesn\'t report if no children', assert => {
    let done = assert.async();
    let didReport = false;

    class MyEl extends Bram.Element {
      childrenConnectedCallback() {
        didReport = true;
      }
    }

    customElements.define('dynamic-no-children', MyEl);

    var el = document.createElement('dynamic-no-children');
    host.appendChild(el);

    later(() => {
      assert.ok(!didReport, 'Should not have reported children');
      done();
    });
  });

  QUnit.test('reports if children exist before insertion', assert => {
    let done = assert.async();

    class MyEl extends Bram.Element {
      childrenConnectedCallback() {
        var children = this.childNodes;
        assert.equal(children.length, 1);
        assert.equal(children[0].className, 'foobar');
        done();
      }
    }

    customElements.define('dynamic-with-children', MyEl);

    var el = document.createElement('dynamic-with-children');
    var span = document.createElement('span');
    span.className = 'foobar';
    el.appendChild(span);

    host.appendChild(el);
  });

  QUnit.test('reports if children are added later', assert => {
    let done = assert.async();
    let i = 0;

    class MyEl extends Bram.Element {
      connectedCallback() {
        super.connectedCallback();
        // This is just for timing, to make sure this callback
        // is called before children are added.
        assert.equal(i, 0);

      }
      childrenConnectedCallback() {
        var children = this.childNodes;
        assert.equal(children.length, 1);
        assert.equal(children[0].className, 'foobar');
        done();
      }
    }

    customElements.define('dynamic-children', MyEl);

    let el = document.createElement('dynamic-children');
    host.appendChild(el);

    later(function(){
      i++;
      let span = document.createElement('span');
      span.className = 'foobar';
      el.appendChild(span);
    });
  });
});
