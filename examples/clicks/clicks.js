
class ClickCount extends Bram.Element {
  static model() {
    return {
      count: 0
    };
  }

  static template() {
    return document.querySelector('#click-template');
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

  get count() {
    return this.model.count;
  }

  set count(val){
    this.model.count = val;
  }
}

customElements.define('click-count', ClickCount);
