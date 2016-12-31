import hydrate from './hydrate.js';
import inspect from './inspect.js';
import Link from './link.js';
import Scope from './scope.js';

export default function(template){
  template = (template instanceof HTMLTemplateElement) ? template : document.querySelector(template);
  var paths = inspect(template.content, {id:0}, {});

  return function(scope){
    if(!(scope instanceof Scope)) {
      scope = new Scope(scope);
    }

    var frag = document.importNode(template.content, true);
    var link = new Link(frag);
    hydrate(link, paths, scope);
    return link;
  };
};
