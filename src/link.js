import { on as modelOn,  off as modelOff } from './model.js';
import Map from './map2.js';

class Link {
  constructor(frag) {
    this.tree = frag;
    this.models = new Map();
    this.elements = new Map();
    this.children = [];
  }

  loop(map, cb) {
    for(let [key, val] of map) {
      cb(key, val[0], val[1]);
    }
  }

  on(obj, event, fn, isModel) {
    this.models.set(obj, event, fn);
    modelOn(obj, event, fn);
  }

  off(obj, event, fn) {
    this.models.delete(obj, event);
    modelOff(obj, event, fn);
  }

  bind(node, event, fn) {
    this.elements.set(node, event, fn);
    node.addEventListener(event, fn);
  }

  attach() {
    this.loop(this.models, modelOn);
    this.children.forEach(function(link){
      link.attach();
    });
  }

  detach() {
    this.loop(this.models, modelOff);
    this.children.forEach(function(link){
      link.detach();
    });
  }

  add(link) {
    this.children.push(link);
  }

  remove(link) {
    var idx = this.children.indexOf(link);
    this.children.splice(idx, 1);
  }
}

export default Link;
