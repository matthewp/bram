
import { TemplateProcessor } from '../node_modules/@matthewp/template-instantiation/lib/template-processor.js';
import { NodeTemplatePart, AttributeTemplatePart, InnerTemplatePart, TemplatePart } from '../node_modules/@matthewp/template-instantiation/lib/template-part.js';
import createInstance from './instance.js';

function notImplemented() {
  throw new Error('Not yet implemented');
}

class AttrLikePart extends TemplatePart {
  constructor(attributePart) {
    super();
    Object.assign(this, attributePart);
  }
}

class EventTemplatePart extends AttrLikePart {
  constructor(attributePart, _state, _thisValue) {
    super(attributePart);
    this._state = _state;
    this._thisValue = _thisValue;
    this._eventName = this.rule.attributeName.substr(1);
  }

  applyValue(value) {
    const listener = value.bind(this._thisValue || this._state);
    this.element.addEventListener(this._eventName, listener);
  }
}

class PropertyTemplatePart extends AttrLikePart {
  applyValue(value) {
    let prop = this.rule.expressions[0];
    Reflect.set(this.element, prop, value);
  }
}

function conditional(left, right) {
  let parent, nodes = Array.from(left.childNodes);

  function frag() {
    let f = document.createDocumentFragment();
    for(let node of nodes) f.appendChild(node);
    return f;
  }

  function update(showLeft) {
    if(showLeft) {
      parent = right.parentNode;
      parent.insertBefore(frag(), right);
      parent.removeChild(right);
    } else {
      parent.insertBefore(right, left[0]);
      for(let node of nodes) {
        parent.removeChild(node);
      }
    }
  }

  return update;
}

function processConditional(part, state) {
  let prop = part.rule.expression;
  let value = !!state[prop];

  // Note that this can likely be simpler
  if(!part.conditional) {
    let instance = createInstance(part.template, state);
    part.conditional = conditional(instance.fragment, part.startNode);
    part.sourceValue = false;
  }

  if(value !== part.sourceValue) {
    part.sourceValue = value;
    part.conditional(value);
  }
}

function processForEach(part, state) {
  let { expression } = part.rule;
  let value = state[expression];

  if(value) {
    part.parentNode = part.startNode.parentNode;
    part.clear();

    for(let item of value) {
      let model = { item, ...(typeof item === 'object' && item) };
      let instance = createInstance(part.template, model);

      for(let node of [...instance.fragment.childNodes]) {
        part.appendNode(node);
      }
    }
  }

}

export class BramTemplateProcessor extends TemplateProcessor {
    constructor(thisValue) {
      super();
      this._thisValue = thisValue;
    }
    createdCallback(_parts, _state) {
      let part = _parts[0], i = 0;
      while(part) {
        let isAttr = (part instanceof AttributeTemplatePart);
        if(isAttr && part.rule.attributeName.startsWith('@')) {
          _parts[i] = new EventTemplatePart(part, _state, this._thisValue);
        }
        else if(isAttr && part.rule.attributeName.startsWith('.')) {
          _parts[i] = new PropertyTemplatePart(part);
        }

        i++;
        part = _parts[i];
      }
    }
    processCallback(parts, state) {
        for (const part of parts) {
            if (part instanceof InnerTemplatePart) {
              let directive = part.template.getAttribute('directive');
              switch(directive) {
                case 'if': return processConditional(part, state);
                case 'foreach': return processForEach(part, state);
              }
            }
            else if (part instanceof NodeTemplatePart) {
                const { expression } = part.rule;
                part.value = state && expression && state[expression];
            }
            else if (part instanceof AttributeTemplatePart) {
                const { expressions } = part.rule;
                part.value = state && expressions &&
                    expressions.map(expression => state && state[expression]);
            }
            else if((part instanceof EventTemplatePart) || part instanceof PropertyTemplatePart) {
              const { expressions } = part.rule;
              part.value = state && state[expressions[0]];
            }
        }
    }
}
;