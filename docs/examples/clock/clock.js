class AnalogClock extends Bram.Element {
  static get template() {
    return '#clock-template';
  }

  constructor() {
    super();
    this.setTime();
  }

  connectedCallback() {
    super.connectedCallback();
    this.intervalId = setInterval(_ => this.setTime(), 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.intervalId);
  }

  setTime() {
    let time = new Date();

    this.model.hourDegree = time.getHours() / 12 * 360;
    this.model.minuteDegree = time.getMinutes() / 60 * 360;
    this.model.secondDegree = time.getSeconds() / 60 * 360;
  }
}

customElements.define('analog-clock', AnalogClock);
