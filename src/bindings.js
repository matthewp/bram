
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
  each: function(node, parentScope, prop){
    var hydrate = Bram.template(node);

    var info = parentScope.read(prop);
    var array = info.value;
    var comp = slice.call(array);
    var placeholder = document.createTextNode('');
    node.parentNode.replaceChild(placeholder, node);
    var children = [];

    var render = function(model, i){
      var scope = parentScope.add(model).add({item: model, index: i});
      var frag = hydrate(scope);

      var childNodes = slice.call(frag.childNodes);
      var parent = placeholder.parentNode;

      var sibling = children[i + 1];
      if(sibling) {
        var lastChild = sibling.nodes[0];
        parent.insertBefore(frag, lastChild);
      } else {
        parent.appendChild(frag);
      }

      children[i] = { scope: scope, nodes: childNodes };
    };

    array.forEach(render);

    Bram.addEventListener(array, Bram.arrayChange, function(ev, value){
      var child;
      var index = ev.index;
      var oldIndex = comp.indexOf(value);
      if(oldIndex !== -1) {
        child = children[oldIndex];
        children[index] = child;
        children[oldIndex] = undefined;
        child.scope.model.index = index;
      } else if((child = children[index])) {
        child.scope.model.item = value;
      } else {
        render(value, index);
      }
      comp = slice.call(array);
    });
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
