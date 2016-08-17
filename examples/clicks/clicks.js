
var template = document.querySelector('#click-template');

class ClickCount extends HTMLElement {
  createdCallback() {
    this.hydrate = Bram.template(template);
    this.model = Bram.model({
      count: 0
    });
  }

  attachedCallback() {
    var tree = this.hydrate(this.model);
    this.appendChild(tree);

    this.querySelector('button').addEventListener('click', this);
  }

  detachedCallback() {
    this.querySelector('button').removeEventListener('click', this);
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

document.registerElement('click-count', ClickCount);
