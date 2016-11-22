class BramPanel extends Bram.Element {
  static get observedAttributes() {
    return ['title', 'active'];
  }

  static get observedProperties() {
    return ['title', 'active'];
  }
}

customElements.define('bram-panel', BramPanel);

class BramTabs extends Bram.Element {
  static get template() {
    return '#tabs-template';
  }

  constructor() {
    super();
    this.model.titles = [];
  }

  childrenConnectedCallback() {
    this.model.titles.length = 0;
    [].forEach.call(this.children, (child, i) => {
      this.model.titles.push(child.title);

      if(!this.active && i === 0) {
        child.active = true;
        this.active = child;
      }
    });
  }

  setActive(ev) {
    ev.preventDefault();
    var idx = +ev.target.dataset.index;
    if(this.active) {
      this.active.active = false;
    }
    this.active = this.children[idx];
    this.active.active = true;
  }
}

customElements.define('bram-tabs', BramTabs);
