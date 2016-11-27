import stamp from './stamp.js';
import {
  arrayChange,
  on,
  off
} from './model.js';
import { slice } from './util.js';

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
  event: function(node, eventName, scope, parseResult){
    var prop = parseResult.raw;
    node.addEventListener(eventName, function(ev){
      var readResult = scope.read(prop);
      readResult.value.call(readResult.model, ev);
    });
  },
  each: function(node, parentScope, parseResult){
    var hydrate = stamp(node);
    var prop = parseResult.props()[0];
    var scopeResult = parentScope.read(prop);
    var placeholder = document.createTextNode('');
    node.parentNode.replaceChild(placeholder, node);

    var observe = function(list){
      var itemMap = new Map();
      var indexMap = new Map();

      var render = function(item, i){
        var scope = parentScope.add(item).add({ item: item, index: i});
        var frag = hydrate(scope);

        var info = {
          item: item,
          nodes: slice.call(frag.childNodes),
          scope: scope,
          index: i
        };
        itemMap.set(item, info);
        indexMap.set(i, info);

        var siblingInfo = indexMap.get(i + 1);
        var parent = placeholder.parentNode;
        if(siblingInfo) {
          var firstChild = siblingInfo.nodes[0];
          parent.insertBefore(frag, firstChild);
        } else {
          parent.appendChild(frag);
        }
      };

      var remove = function(index){
        var info = indexMap.get(index);
        if(info) {
          info.nodes.forEach(function(node){
            node.parentNode.removeChild(node);
          });
          itemMap.delete(info.item);
          indexMap.delete(index);
        }
      };

      list.forEach(render);

      var onarraychange = function(ev, value){
        if(ev.type === 'delete') {
          remove(ev.index);
          return;
        }

        var info = itemMap.get(value);
        if(info) {
          var oldIndex = info.index;
          var hasChanged = oldIndex !== ev.index;
          if(hasChanged) {
            info.scope.model.index = info.index = ev.index;

            var existingItem = indexMap.get(ev.index);
            if(existingItem) {
              indexMap.set(oldIndex, existingItem);
            } else {
              indexMap.delete(oldIndex);
            }
            indexMap.set(ev.index, info);

            var ref = indexMap.get(ev.index + 1);
            if(ref) {
              ref = ref.nodes[0];
            }

            var nodeIdx = info.nodes.length - 1;
            while(nodeIdx >= 0) {
              placeholder.parentNode.insertBefore(info.nodes[nodeIdx], ref);
              nodeIdx--;
            }
          }
        } else {
          remove(ev.index);
          render(value, ev.index);
        }
      };

      on(list, arrayChange, onarraychange);

      return function(){
        for(var i = 0, len = list.length; i < len; i++) {
          remove(i);
        }
        off(list, arrayChange, onarraychange);
        itemMap = null;
        indexMap = null;
      };
    };

    var teardown = observe(scopeResult.value);

    on(scopeResult.model, prop, function(ev, newValue){
      teardown();
      teardown = observe(newValue);
    });
  },
  if: function(node, parentScope){
    var hydrate = stamp(node);
    var rendered = false;
    var child = {};
    var placeholder = document.createTextNode('');
    node.parentNode.replaceChild(placeholder, node);
    return function(val){
      if(!rendered) {
        if(val) {
          var scope = parentScope.add(val);
          var frag = hydrate(scope);
          child.children = slice.call(frag.childNodes);
          child.scope = scope;
          placeholder.parentNode.insertBefore(frag, placeholder.nextSibling);
          rendered = true;
        }
      } else {
        var parent = placeholder.parentNode;
        var sibling = placeholder.nextSibling;
        if(val) {
          child.children.forEach(function(node){
            parent.insertBefore(node, sibling);
          });
        } else {
          child.children.forEach(function(node){
            parent.removeChild(node);
          });
        }
      }
    };
  }
};

function setupBinding(scope, parseResult, fn){
  var compute = parseResult.compute(scope);

  var set = function(){
    fn(compute());
  };

  parseResult.props().forEach(function(prop){
    var info = scope.readInTransaction(prop);
    var model = info.model;
    if(info.bindable !== false) {
      info.reads.forEach(function(read){
        on(read[0], read[1], set);
      });
    }
  });

  set();
}

export { live, setupBinding };
