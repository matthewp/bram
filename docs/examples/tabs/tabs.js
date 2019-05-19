import Bram from '../../../bram.js';

const template = document.querySelector('#tabs-template');

class BramPanel extends Bram.Element {
  get active() {
    return this.hasAttribute('active');
  }

  set active(value) {
    if(value) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    } 
  }
}

customElements.define('bram-panel', BramPanel);

class BramTabs extends Bram.Element {
  constructor() {
    super();
    this.model = this.attachView(template, {
      titles: [],
      setActive: e => this.setActive(e)
    });
  }

  childrenConnectedCallback() {
    this.model.titles.length = 0;

    for(let child of this.children) {
      this.model.titles.push(child.title);
    }

    if(!this.active) {
      let child = this.children[0];
      child.active = true;
      this.active = child;
      this.activeTab = this.shadowRoot.querySelector('li');
      this.activeTab.classList.add('active');
    }
  }

  setActive(ev) {
    ev.preventDefault();
    var idx = +ev.target.dataset.index;
    if(this.active) {
      this.active.active = false;
      this.activeTab.classList.remove('active');
    }
    this.active = this.children[idx];
    this.active.active = true;
    this.activeTab = ev.target.parentNode;
    this.activeTab.classList.add('active');
  }
}

customElements.define('bram-tabs', BramTabs);
