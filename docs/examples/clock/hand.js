class Hand extends Bram.Element {
  static template() {
    return handTemplate;
  }

  static get observedAttributes() {
    return ['color'];
  }

  constructor() {
    super();

    this.color = '#aaa';
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    this[attr] = newVal;
  }

  set color(val) {
    this.model.color = val;
  }

  get width() {
    return this.model.width;
  }

  set width(val) {
    this.model.width = val;
  }

  get height() {
    return 50 - this.width * 4 + '%';
  }

  get borderRadius() {
    return this.width / 2;
  }

  get degree() {
    return this.model.degree;
  }

  set degree(val) {
    this.model.degree = val;
  }

  get handTransform() {
    let width = this.width;
    let degree = this.degree || 0;
    return `translate(${-width/2}px,${-width/2}px) rotate(${degree-180}deg)`;
  }
}

customElements.define('clock-hand', Hand);

