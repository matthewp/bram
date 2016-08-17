if(typeof Map !== "function") {
  var bid = Bram.symbol('bid'),
    bidCnt = 1;

  function BID(obj){
    var type = typeof obj;
    if(type === 'string' || type === 'number')
      return obj;
    var id = obj[bid];
    if(!id) {
      Object.defineProperty(obj, bid, {
        value: id++,
        enumerable: false,
        writable: false,
        configurable: false
      });
    }
    return id;
  }

  function Map(){
    this.k = {};
  }
  Map.prototype.set = function(key, value){
    var id = BID(obj);
    this.k[id] = value;
  };
  Map.prototype.get = function(key){
    return this.k[BID(key)];
  };
  Map.prototype.delete = function(key){
    delete this.k[BID(key)];
  };
}
