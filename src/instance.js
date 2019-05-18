
import createTemplateInstance from '../node_modules/@matthewp/template-instantiation/lib/html-template-element.js';
import { BramTemplateProcessor } from './processor.js';
import { toModel } from './model.js';

function createInstance(template, baseModel = {}) {
  let processor = new BramTemplateProcessor();
  let model = toModel(baseModel, () => {
    fragment.update(model);
  });
  let fragment = createTemplateInstance(template, processor, model);

  return {
    model, fragment,
    update() {
      fragment.update(model);
    }
  };
}

export default createInstance;