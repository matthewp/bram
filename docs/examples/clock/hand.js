class Hand extends Bram.Element {
  static get template() {
    return '#hand-template';
  }

  static get observedProperties() {
    return ['width', 'degree', 'color']
  }

  static get observedAttributes() {
    return ['color'];
  }

  constructor() {
    super();
    this.color = '#aaa';
  }

  get height() {
    return 50 - this.width * 4 + '%';
  }

  get borderRadius() {
    return this.width / 2;
  }

  get handTransform() {
    let width = this.width;
    let degree = this.degree || 0;
    return `translate(${-width/2}px,${-width/2}px) rotate(${degree-180}deg)`;
  }
}

customElements.define('clock-hand', Hand);

