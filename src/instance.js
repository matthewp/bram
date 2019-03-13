
import createTemplateInstance from '../node_modules/@matthewp/template-instantiation/lib/html-template-element.js';
import { BramTemplateProcessor } from './processor.js';
import { toModel } from './model.js';

function createInstance(template, baseModel = {}, thisValue) {
  let processor = new BramTemplateProcessor(thisValue);
  let ti = createTemplateInstance(template, processor, baseModel);
  const model = toModel(baseModel, () => {
    ti.update(model);
  });

  return {
    model,
    fragment: ti,
    update() {
      ti.update(model);
    }
  };
}

export default createInstance;