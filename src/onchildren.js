// TODO make this part of the main API

Bram.onChildren = function(element, callback){
  var cancelled = false;
  var report = function(){
    if(!cancelled) {
      callback(element.childNodes);
    }
  };

  var mo = new MutationObserver(report);
  mo.observe(element, { childList: true });

  if(element.childNodes.length) {
    Promise.resolve().then(report);
  }

  return function(){
    cancelled = true;
    mo.disconnect();
  };
};
