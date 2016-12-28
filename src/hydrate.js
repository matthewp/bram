import { some, slice } from './util.js';

function hydrate(link, callbacks, scope) {
  var paths = Object.keys(callbacks);
  var id = +paths.shift();
  var cur = 0;

  traverse(link.tree);

  function check(node) {
    cur++;
    if(id === cur) {
      var callback = callbacks[id];
      callback(node, scope, link);
      id = +paths.shift();
    }
    return !id;
  }

  function traverse(node){
    var exit;
    var attributes = slice.call(node.attributes || []);
    some.call(attributes, function(){
      exit = check(node);
      if(exit) {
        return true;
      }
    });
    if(exit) return false;

    some.call(node.childNodes, function(child){
      exit = check(child);
      if(exit) {
        return true;
      }

      exit = !traverse(child);
      if(exit) {
        return true;
      }
    });
    return !exit;
  }
}

export default hydrate;
