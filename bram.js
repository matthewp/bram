var symbol = typeof Symbol === 'function' ? Symbol :
  function(str){ return '@@-' + str; };

const asap = Promise.resolve().then.bind(Promise.resolve());

class Transaction {
  static add(t) {
    this.current = t;
    this.stack.push(t);
  }

  static remove() {
    this.stack.pop();
    this.current = this.stack[this.stack.length - 1];
  }

  static observe(model, prop) {
    if(this.current) {
      this.current.stack.push([model, prop]);
    }
  }

  constructor() {
    this.stack = [];
  }

  start() {
    Transaction.add(this);
  }

  stop() {
    Transaction.remove();
    return this.stack;
  }
}

Transaction.stack = [];

function isArraySet(object, property){
  return Array.isArray(object) && !isNaN(+property);
}

function isArrayOrObject(object) {
  return Array.isArray(object) || typeof object === 'object';
}

function observe(o, fn) {
  var proxy = new Proxy(o, {
    get: function(target, property) {
      Transaction.observe(proxy, property);
      return target[property];
    },
    set: function(target, property, value) {
      var oldValue = target[property];
      if(!isModel(value) && isArrayOrObject(value)) {
        value = toModel(value, fn);
      }
      target[property] = value;

      // If the value hasn't changed, nothing else to do
      if(value === oldValue)
        return true;

      if(isArraySet(target, property)) {
        fn({
          prop: arrayChange,
          index: +property,
          type: 'set'
        }, value);
      } else {
        fn({
          prop: property,
          type: 'set'
        }, value);
      }

      return true;
    },
    deleteProperty: function(target, property, value){
      if(isArraySet(target, property)) {
        fn({
          prop: arrayChange,
          index: +property,
          type: 'delete'
        });
      }

      return true;
    }
  });
  return proxy;
}

var events = symbol('bram-events');
var arrayChange = symbol('bram-array-change');

var toModel = function(o, callback){
  if(isModel(o)) return o;

  o = deepModel(o) || {};

  Object.defineProperty(o, events, {
    value: {},
    enumerable: false
  });

  return observe(o, callback);
};

function deepModel(o) {
  return !o ? o : Object.keys(o).reduce(function(acc, prop){
    var val = o[prop];
    acc[prop] = (Array.isArray(val) || typeof val === 'object')
      ? toModel(val)
      : val;
    return acc;
  }, o);
}

var isModel = function(object){
  return object && !!object[events];
};

var on = function(model, prop, callback){
  var evs = model[events];
  if(!evs) return;
  var ev = evs[prop];
  if(!ev) {
    ev = evs[prop] = [];
  }
  ev.push(callback);
};

var off = function(model, prop, callback){
  var evs = model[events];
  if(!evs) return;
  var ev = evs[prop];
  if(!ev) return;
  var idx = ev.indexOf(callback);
  if(idx === -1) return;
  ev.splice(idx, 1);
  if(!ev.length) {
    delete evs[prop];
  }
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */
class TemplateProcessor {
}

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */
const partOpenRe = /{{/g;
const partCloseRe = /}}/g;
const parse = (templateString) => {
    const strings = [];
    const expressions = [];
    const boundaryIndex = templateString.length + 1;
    let lastExpressionIndex = partOpenRe.lastIndex =
        partCloseRe.lastIndex = 0;
    while (lastExpressionIndex < boundaryIndex) {
        const openResults = partOpenRe.exec(templateString);
        if (openResults == null) {
            strings.push(templateString.substring(lastExpressionIndex, boundaryIndex));
            break;
        }
        else {
            const openIndex = openResults.index;
            partCloseRe.lastIndex = partOpenRe.lastIndex = openIndex + 2;
            const closeResults = partCloseRe.exec(templateString);
            if (closeResults == null) {
                strings.push(templateString.substring(lastExpressionIndex, boundaryIndex));
            }
            else {
                const closeIndex = closeResults.index;
                strings.push(templateString.substring(lastExpressionIndex, openIndex));
                expressions.push(templateString.substring(openIndex + 2, closeIndex));
                lastExpressionIndex = closeIndex + 2;
            }
        }
    }
    return [strings, expressions];
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */
class TemplateRule {
    constructor(nodeIndex) {
        this.nodeIndex = nodeIndex;
    }
}
class NodeTemplateRule extends TemplateRule {
    constructor(nodeIndex, expression) {
        super(nodeIndex);
        this.nodeIndex = nodeIndex;
        this.expression = expression;
    }
}
class AttributeTemplateRule extends TemplateRule {
    constructor(nodeIndex, attributeName, strings, expressions) {
        super(nodeIndex);
        this.nodeIndex = nodeIndex;
        this.attributeName = attributeName;
        this.strings = strings;
        this.expressions = expressions;
    }
}
class InnerTemplateRule extends NodeTemplateRule {
    constructor(nodeIndex, template) {
        super(nodeIndex, template.getAttribute('expression') || '');
        this.nodeIndex = nodeIndex;
        this.template = template;
    }
}

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */
// Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
const createTreeWalker = (node) => document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
class TemplateDefinition {
    constructor(template) {
        this.template = template;
        this.parseAndGenerateRules();
    }
    cloneContent() {
        return this.parsedTemplate.content.cloneNode(true);
    }
    parseAndGenerateRules() {
        const { template } = this;
        const content = template.content.cloneNode(true);
        const rules = [];
        const mutations = [];
        const walker = createTreeWalker(content);
        let nodeIndex = -1;
        while (walker.nextNode()) {
            nodeIndex++;
            const node = walker.currentNode;
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (!node.hasAttributes()) {
                    continue;
                }
                if (node instanceof HTMLTemplateElement) {
                    const { parentNode } = node;
                    const partNode = document.createTextNode('');
                    mutations.push(() => parentNode.replaceChild(partNode, node));
                    rules.push(new InnerTemplateRule(nodeIndex, node));
                }
                else {
                    const { attributes } = node;
                    // TODO(cdata): Fix IE/Edge attribute order here
                    // @see https://github.com/Polymer/lit-html/blob/master/src/lit-html.ts#L220-L229
                    for (let i = 0; i < attributes.length;) {
                        const attribute = attributes[i];
                        const { name, value } = attribute;
                        const [strings, values] = parse(value);
                        if (strings.length === 1) {
                            ++i;
                            continue;
                        }
                        rules.push(new AttributeTemplateRule(nodeIndex, name, strings, values));
                        node.removeAttribute(name);
                    }
                }
            }
            else if (node.nodeType === Node.TEXT_NODE) {
                const [strings, values] = parse(node.nodeValue || '');
                const { parentNode } = node;
                const document = node.ownerDocument;
                if (strings.length === 1) {
                    continue;
                }
                for (let i = 0; i < values.length; ++i) {
                    const partNode = document.createTextNode(strings[i]);
                    // @see https://github.com/Polymer/lit-html/blob/master/src/lit-html.ts#L267-L272
                    parentNode.insertBefore(partNode, node);
                    rules.push(new NodeTemplateRule(nodeIndex++, values[i]));
                }
                node.nodeValue = strings[strings.length - 1];
            }
        }
        // Execute mutations
        for (let fn of mutations) {
            fn();
        }
        this.rules = rules;
        this.parsedTemplate = document.createElement('template');
        this.parsedTemplate.content.appendChild(content);
    }
}

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */
class TemplatePart {
    constructor(templateInstance, rule) {
        this.templateInstance = templateInstance;
        this.rule = rule;
    }
    get value() {
        return this.sourceValue;
    }
    set value(value) {
        if (value !== this.sourceValue) {
            this.sourceValue = value;
            this.applyValue(value);
        }
    }
}
class AttributeTemplatePart extends TemplatePart {
    constructor(templateInstance, rule, element) {
        super(templateInstance, rule);
        this.templateInstance = templateInstance;
        this.rule = rule;
        this.element = element;
    }
    clear() {
        this.element.removeAttribute(this.rule.attributeName);
    }
    applyValue(value) {
        if (value == null) {
            value = [];
        }
        else if (!Array.isArray(value)) {
            value = [value];
        }
        const { rule, element } = this;
        const { strings, attributeName } = rule;
        const valueFragments = [];
        for (let i = 0; i < (strings.length - 1); ++i) {
            valueFragments.push(strings[i]);
            valueFragments.push(value[i] || '');
        }
        const attributeValue = valueFragments.join('');
        if (attributeValue != null) {
            element.setAttribute(attributeName, attributeValue);
        }
        else {
            element.removeAttribute(attributeName);
        }
    }
}
class NodeTemplatePart extends TemplatePart {
    constructor(templateInstance, rule, startNode) {
        super(templateInstance, rule);
        this.templateInstance = templateInstance;
        this.rule = rule;
        this.startNode = startNode;
        this.currentNodes = [];
        this.move(startNode);
    }
    replace(...nodes) {
        this.clear();
        for (let i = 0; i < nodes.length; ++i) {
            let node = nodes[i];
            if (typeof node === 'string') {
                node = document.createTextNode(node);
            }
            // SPECIAL NOTE(cdata): This implementation supports NodeTemplatePart as
            // a replacement node. Usefulness TBD.
            if (node instanceof NodeTemplatePart) {
                const part = node;
                node = part.startNode;
                this.appendNode(node);
                part.move(node);
            }
            else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
                node.nodeType === Node.DOCUMENT_NODE) {
                // NOTE(cdata): Apple's proposal explicit forbid's document fragments
                // @see https://github.com/w3c/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md
                throw new DOMException('InvalidNodeTypeError');
            }
            else {
                this.appendNode(node);
            }
        }
    }
    /**
     * Forks the current part, inserting a new part after the current one and
     * returning it. The forked part shares the TemplateInstance and the
     * TemplateRule of the current part.
     */
    fork() {
        const node = document.createTextNode('');
        this.parentNode.insertBefore(node, this.nextSibling);
        this.nextSibling = node;
        return new NodeTemplatePart(this.templateInstance, this.rule, node);
    }
    /**
     * Creates a new inner part that is enclosed completely by the current
     * part and returns it. The enclosed part shares the TemplateInstance and the
     * TemplateRule of the current part.
     */
    enclose() {
        const node = document.createTextNode('');
        this.parentNode.insertBefore(node, this.previousSibling.nextSibling);
        return new NodeTemplatePart(this.templateInstance, this.rule, node);
    }
    move(startNode) {
        const { currentNodes, startNode: currentStartNode } = this;
        if (currentStartNode != null &&
            currentStartNode !== startNode &&
            currentNodes.length) {
            this.clear();
        }
        this.parentNode = startNode.parentNode;
        this.previousSibling = startNode;
        this.nextSibling = startNode.nextSibling;
        this.startNode = startNode;
        if (currentNodes && currentNodes.length) {
            this.replace(...currentNodes);
        }
    }
    // SPECIAL NOTE(cdata): This clear is specialized a la lit-html to accept a
    // starting node from which to clear. This supports efficient cleanup of
    // subparts of a part (subparts are also particular to lit-html compared to
    // Apple's proposal).
    clear(startNode = this.previousSibling.nextSibling) {
        if (this.parentNode === null) {
            return;
        }
        let node = startNode;
        while (node !== this.nextSibling) {
            const nextNode = node.nextSibling;
            this.parentNode.removeChild(node);
            node = nextNode;
        }
        this.currentNodes = [];
    }
    appendNode(node) {
        this.parentNode.insertBefore(node, this.nextSibling);
        this.currentNodes.push(node);
    }
    applyValue(value) {
        if (this.currentNodes.length === 1 &&
            this.currentNodes[0].nodeType === Node.TEXT_NODE) {
            this.currentNodes[0].nodeValue = value;
        }
        else {
            this.replace(document.createTextNode(value));
        }
    }
}
class InnerTemplatePart extends NodeTemplatePart {
    constructor(templateInstance, rule, startNode) {
        super(templateInstance, rule, startNode);
        this.templateInstance = templateInstance;
        this.rule = rule;
        this.startNode = startNode;
    }
    get template() {
        return this.rule.template;
    }
}

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */
class TemplateInstance extends DocumentFragment {
    constructor(definition, processor, state) {
        super();
        this.definition = definition;
        this.processor = processor;
        this.createdCallbackInvoked = false;
        this.previousState = null;
        this.appendChild(definition.cloneContent());
        this.generateParts();
        this.update(state);
    }
    update(state) {
        if (!this.createdCallbackInvoked) {
            this.processor.createdCallback(this.parts, state);
            this.createdCallbackInvoked = true;
        }
        this.processor.processCallback(this.parts, state);
        this.previousState = state;
    }
    generateParts() {
        const { definition } = this;
        const { rules } = definition;
        const parts = [];
        const walker = createTreeWalker(this);
        let walkerIndex = -1;
        for (let i = 0; i < rules.length; ++i) {
            const rule = rules[i];
            const { nodeIndex } = rule;
            while (walkerIndex < nodeIndex) {
                walkerIndex++;
                walker.nextNode();
            }
            const part = this.createPart(rule, walker.currentNode);
            parts.push(part);
        }
        this.parts = parts;
    }
    // NOTE(cdata): In the original pass, this was exposed in the
    // TemplateProcessor to be optionally overridden so that parts could
    // have custom implementations.
    createPart(rule, node) {
        if (rule instanceof AttributeTemplateRule) {
            return new AttributeTemplatePart(this, rule, node);
        }
        else if (rule instanceof InnerTemplateRule) {
            return new InnerTemplatePart(this, rule, node);
        }
        else if (rule instanceof NodeTemplateRule) {
            return new NodeTemplatePart(this, rule, node);
        }
        throw new Error(`Unknown rule type.`);
    }
}

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */
const templateDefinitionCache = new Map();
const createInstance = function (template, processor, state, overrideDefinitionCache = false) {
    if (processor == null) {
        throw new Error('The first argument of createInstance must be an implementation of TemplateProcessor');
    }
    if (!templateDefinitionCache.has(template) || overrideDefinitionCache) {
        templateDefinitionCache.set(template, new TemplateDefinition(template));
    }
    const definition = templateDefinitionCache.get(template);
    return new TemplateInstance(definition, processor, state);
};

function notImplemented() {
  throw new Error('Not yet implemented');
}

class EventTemplatePart extends TemplatePart {
  constructor(attributePart, _state, _thisValue) {
    super();
    Object.assign(this, attributePart);
    this._state = _state;
    this._thisValue = _thisValue;
  }

  clear() {
    notImplemented();
  }

  applyValue(value) {
    const listener = value.bind(this._thisValue || this._state);
    this.element.addEventListener('click', listener);
  }
}

class BramTemplateProcessor extends TemplateProcessor {
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

        i++;
        part = _parts[i];
      }
    }
    processCallback(parts, state) {
        for (const part of parts) {
            if (part instanceof InnerTemplatePart) ;
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

function createInstance$1(template, baseModel = {}, thisValue) {
  let processor = new BramTemplateProcessor(thisValue);
  let ti = createInstance(template, processor, baseModel);
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

function getTemplate(name) {
  return typeof name === 'string' ? document.querySelector(name) : name;
}

function Bram(Element) {
  return class extends Element {
    constructor() {
      super();

      // Initially an empty object
      const Element = this.constructor;
      this._instance = createInstance$1(getTemplate(Element.template),
        Object.create(this), this);
      this.model = this._instance.model;

      // TODO remove
      this._hasRendered = false;

      let events = Element.events;
      if(events && !Element._hasSetupEvents) {
        installEvents(Element);
      }

      let props = !Element._hasInstalledProps && Element.observedProperties;
      if(props) {
        Element._hasInstalledProps = true;
        installProps(Element, props, Element.observedAttributes);
      }
    }

    connectedCallback() {
      this._instance.update();
      if(this._instance && !this._hasRendered) {
        let renderMode = this.constructor.renderMode;
        if(renderMode === 'light') {
          this.innerHTML = '';
          this.appendChild(this._instance.fragment);
        } else {
          this.attachShadow({ mode: 'open' });
          this.shadowRoot.appendChild(this._instance.fragment);
        }
        this._hasRendered = true;
      } else if(this._hasRendered) ;
      if(this.childrenConnectedCallback) {
        this._disconnectChildMO = setupChildMO(this);
      }
    }

    disconnectedCallback() {
      if(this._disconnectChildMO) {
        this._disconnectChildMO();
      }
      if(this._link) {
        this._link.detach();
      }
    }

    attributeChangedCallback(name, oldVal, newVal) {
      var sa = this.constructor._syncedAttrs;
      var synced = sa && sa[name];
      if(synced && this[name] !== newVal) {
        this[name] = newVal;
      }
    }
  }
}

const Element = Bram(HTMLElement);
Bram.Element = Element;
Bram.model = toModel;
Bram.on = on;
Bram.off = off;
Bram.createInstance = createInstance$1;

function installEvents(Element) {
  Element._hasSetupEvents = true;
  Element.events.forEach(function(eventName){
    Object.defineProperty(Element.prototype, 'on' + eventName, {
      get: function(){
        return this['_on' + eventName];
      },
      set: function(fn){
        var prop = '_on' + eventName;
        var cur = this[prop];
        if(cur) {
          this.removeEventListener(eventName, cur);
        }
        this[prop] = fn;
        this.addEventListener(eventName, fn);
      }
    });
  });
}

function installProps(Element, props, attributes = []) {
  Element._syncedAttrs = {};
  var proto = Element.prototype;
  props.forEach(function(prop){
    var desc = Object.getOwnPropertyDescriptor(proto, prop);
    if(!desc) {
      var hasAttr = attributes.indexOf(prop) !== -1;
      if(hasAttr) {
        Element._syncedAttrs[prop] = true;
      }
      Object.defineProperty(proto, prop, {
        get: function() {
          return this.model[prop];
        },
        set: function(val) {
          this.model[prop] = val;
          if(hasAttr) {
            var cur = this.getAttribute(prop);
            if(typeof val === 'boolean') {
              if(val && cur !== '') {
                this.setAttribute(prop, '');
              } else if(cur === '' && !val) {
                this.removeAttribute(prop);
              }
              return;
            } else if(cur !== val) {
              this.setAttribute(prop, val);
            }
          }
        }
      });
    }
  });
}

function setupChildMO(inst) {
  var cancelled = false;
  var report = function(){
    if(!cancelled) {
      inst.childrenConnectedCallback();
    }
  };

  var mo = new MutationObserver(report);
  mo.observe(inst, { childList: true });

  if(inst.childNodes.length) {
    asap(report);
  }

  return function(){
    cancelled = true;
    mo.disconnect();
  };
}

export default Bram;
export { Element, Bram };
