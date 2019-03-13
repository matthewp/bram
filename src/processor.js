
import { TemplateProcessor } from '../node_modules/@matthewp/template-instantiation/lib/template-processor.js';
import { NodeTemplatePart, AttributeTemplatePart, InnerTemplatePart, TemplatePart } from '../node_modules/@matthewp/template-instantiation/lib/template-part.js';

function notImplemented() {
  throw new Error('Not yet implemented');
}

class EventTemplatePart extends TemplatePart {
  constructor(attributePart, _state) {
    super();
    Object.assign(this, attributePart);
    this._state = _state;
  }

  clear() {
    notImplemented();
  }

  applyValue(value) {
    const listener = value.bind(this._state);
    this.element.addEventListener('click', listener);
  }
}

export class BramTemplateProcessor extends TemplateProcessor {
    createdCallback(_parts, _state) {
      let part = _parts[0], i = 0;
      while(part) {
        if((part instanceof AttributeTemplatePart) && part.rule.attributeName.startsWith('@')) {
          _parts[i] = new EventTemplatePart(part, _state);
        }

        i++;
        part = _parts[i];
      }
    }
    processCallback(parts, state) {
        for (const part of parts) {
            if (part instanceof InnerTemplatePart) {
                // TODO
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
            else if(part instanceof EventTemplatePart) {
              const { expressions } = part.rule;
              part.value = state && state[expressions[0]];
            }
        }
    }
}
;