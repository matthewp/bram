
import createTemplateInstance from '../node_modules/@matthewp/template-instantiation/lib/html-template-element.js';
import { BramTemplateProcessor } from './processor.js';
import { toModel } from './model.js';

function createInstance(template, baseModel = {}, thisValue) {
  let processor = new BramTemplateProcessor(thisValue);
  let fragment = createTemplateInstance(template, processor, baseModel);
  let model = toModel(baseModel, () => {
    fragment.update(model);
  });

  return {
    model, fragment,
    update() {
      fragment.update(model);
    }
  };
}

export default createInstance;