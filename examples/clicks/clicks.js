
class ClickCount extends Bram.Element {
  static template() {
    return document.querySelector('#click-template');
  }

  constructor() {
    super();
    this.count = 0;
  }

  inc() {
    this.count++;
  }
}

customElements.define('click-count', ClickCount);
