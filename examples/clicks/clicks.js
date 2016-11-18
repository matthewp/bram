
class ClickCount extends Bram.Element {
  static template() {
    return document.querySelector('#click-template');
  }

  constructor() {
    super();
    this.count = 0;
  }

  connectedCallback() {
    super.connectedCallback();

    let root = this.shadowRoot;
    root.querySelector('button').addEventListener('click', this);
  }

  disconnectedCallback() {
    let root = this.shadowRoot;
    root.querySelector('button').removeEventListener('click', this);
  }

  handleEvent(ev){
    this.count++;
  }
}

customElements.define('click-count', ClickCount);
