
import createTemplateInstance from '../node_modules/@matthewp/template-instantiation/lib/html-template-element.js';
import { BramTemplateProcessor } from './processor.js';
import { toModel } from './model.js';

function createInstance(template, baseModel = {}) {
  let allowUpdate = true, updateQueued = false;

  function bramHandler(handler, event) {
    allowUpdate = false;
    handler.call(this, event);
    allowUpdate = true;
    if(updateQueued) {
      update();
      updateQueued = false;
    }
  }

  function update() {
    if(allowUpdate) {
      allowUpdate = false;
      fragment.update(model);
      allowUpdate = true;
    } else {
      updateQueued = true;
    }
  }

  let processor = new BramTemplateProcessor(bramHandler);
  let model = toModel(baseModel, update);
  let fragment = createTemplateInstance(template, processor, model);

  return {
    model, fragment,
    update() {
      fragment.update(model);
    }
  };
}

export default createInstance;