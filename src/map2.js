class MapOfMap {
  constructor() {
    this.map = new Map();
  }

  set(key1, key2, val) {
    let map = this.map.get(key1);
    if(!map) {
      map = new Map();
      this.map.set(key1, map);
    }
    map.set(key2, val);
  }

  delete(key1, key2) {
    let map = this.map.get(key1);
    if(map) {
      map.delete(key2);
    }
  }
}

export default MapOfMap;
