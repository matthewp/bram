
import { TemplateProcessor } from '../node_modules/@matthewp/template-instantiation/lib/template-processor.js';
import { NodeTemplatePart, AttributeTemplatePart, InnerTemplatePart, TemplatePart } from '../node_modules/@matthewp/template-instantiation/lib/template-part.js';

function notImplemented() {
  throw new Error('Not yet implemented');
}

class EventTemplatePart extends TemplatePart {
  constructor(attributePart, _state, _thisValue) {
    super();
    Object.assign(this, attributePart);
    this._state = _state;
    this._thisValue = _thisValue;
    this._eventName = this.rule.attributeName.substr(1);
  }

  applyValue(value) {
    const listener = value.bind(this._thisValue || this._state);
    this.element.addEventListener(this._eventName, listener);
  }
}

class PropertyTemplatePart extends TemplatePart {
  constructor(attributePart) {
    super();
    Object.assign(this, attributePart);
  }

  applyValue(value) {
    let prop = this.rule.expressions[0];
    Reflect.set(this.element, prop, value);
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
        if((part instanceof AttributeTemplatePart) && part.rule.attributeName.startsWith('@')) {
          _parts[i] = new EventTemplatePart(part, _state, this._thisValue);
        }
        else if((part instanceof AttributeTemplatePart) && part.rule.attributeName.startsWith('.')) {
          _parts[i] = new PropertyTemplatePart(part);
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
            else if((part instanceof EventTemplatePart) || part instanceof PropertyTemplatePart) {
              const { expressions } = part.rule;
              part.value = state && state[expressions[0]];
            }
        }
    }
}
;