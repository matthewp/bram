import { some, slice } from './util.js';

function hydrate(link, callbacks, scope) {
  var paths = Object.keys(callbacks);
  if(paths.length === 0) return;
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

    var child = node.firstChild, nextChild;
    while(child) {
      nextChild = child.nextSibling;
      exit = check(child);
      if(exit) {
        break;
      }

      exit = !traverse(child);
      if(exit) {
        break;
      }
      child = nextChild;
    }

    return !exit;
  }
}

export default hydrate;
