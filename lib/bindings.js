var live = {
  attr: function(node, attrName){
    return function(val){
      node.setAttribute(attrName, val);
    };
  },
  text: function(node){
    return function(val){
      node.nodeValue = val;
    };
  },
  prop: function(node, prop){
    return function(val){
      node[prop] = val;
    };
  },
  each: function(node){
    return function(){

    };
  },
  if: function(node){ /* TODO figure this one out */}
};

function setupBinding(model, prop, fn){
  var set = function(ev, newVal){
    fn(newVal);
  };

  Bram.addEventListener(model, prop, set);
  set({}, model[prop]);
}

function setupListBinding(model, prop, fn){
  
}