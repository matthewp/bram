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
  each: function(node, parentScope){
    var hydrate = Bram.template(node);
    var holder = document.createTextNode('');
    node.parentNode.replaceChild(holder, node);
    return function(model){
      var scope = new Scope(model, parentScope);
      var frag = hydrate(scope);

      // TODO need to for real figure out what to put stuff.
      var ref = holder.nextSibling;
      holder.parentNode.insertBefore(frag, ref);
    };
  },
  if: function(node){ /* TODO figure this one out */}
};

function setupBinding(scope, prop, fn){
  var set = function(ev, newVal){
    fn(newVal);
  };

  var info = scope.read(prop);
  var model = info.model;
  if(info.bindable === false) {
    set({}, model);
  } else {
    Bram.addEventListener(model, prop, set);
    set({}, model[prop]);
  }
}

function setupArrayBinding(scope, prop, fn) {
  var model = scope.read(prop).model,
    array = model[prop],
    length = array.length,
    key = Symbol('bram-array-binding');

  // Change the list when the list itself changes
  Bram.addEventListener(model, prop, function setArray(){
    array = model[prop];
  });

  array.forEach(function(item, i){
    item[key] = true;
    setupBinding(array, i, fn);
  });

  Bram.addEventListener(array, 'length', function(ev, newLength){
    // TODO new thing to set up.
    var i, item;

    // Push, look for new items added to the end.
    if(newLength > length) {
      i = newLength - 1;

      while((item = array[i]) && !item[key]) {
        setupBinding(new Scope(array), i, fn);

        i--;
      }
    }
  });
}
