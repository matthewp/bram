
var createNodes = function (subclasses, superclasses) {
  var className, specs;
  if (null == superclasses)
    superclasses = [];
  for (className in subclasses) {
    if (!isOwn$(subclasses, className))
      continue;
    specs = subclasses[className];
    (function (className) {
      var externalCtor$, isCategory, klass, params, superclass;
      superclass = null != superclasses[0] ? superclasses[0] : function () {
      };
      isCategory = 'undefined' !== typeof specs && null != specs && specs.length === 2;
      params = 'undefined' !== typeof specs && null != specs ? function () {
        switch (specs.length) {
        case 0:
          return [];
        case 1:
        case 2:
          return specs[0];
        }
      }.call(this) : null;
      if (null != params)
        params;
      else
        params = null != superclass.prototype.childNodes ? superclass.prototype.childNodes : [];
      klass = function (super$) {
        extends$(class$, super$);
        externalCtor$ = isCategory ? function () {
        } : function () {
          var i, param;
          for (var i$ = 0, length$ = params.length; i$ < length$; ++i$) {
            param = params[i$];
            i = i$;
            this[param] = arguments[i];
          }
          if (null != this.initialise)
            this.initialise.apply(this, arguments);
          return this;
        };
        function class$() {
          return externalCtor$.apply(this, arguments);
        }
        class$.prototype.className = className;
        class$.superclasses = superclasses;
        return class$;
      }(superclass);
      if (null != ('undefined' !== typeof specs && null != specs ? specs[0] : void 0))
        klass.prototype.childNodes = specs[0];
      if (isCategory)
        createNodes(specs[1], [klass].concat([].slice.call(superclasses)));
      return exports[className] = klass;
    }(className));
  }
};

createNodes({
  Nodes: [
    [],
    {
      Import: [['module']],
      Primitives: [
        ['data'],
        {
          Bool: null,
          Numbers: [

          ],
          String: null
        }
      ],
      Program: [['body']],
      Block: [['statements']]
    }
  ]
});

function isOwn$(o, p) {
    return {}.hasOwnProperty.call(o, p);
}

function extends$(child, parent) {
  for (var key in parent)
    if (isOwn$(parent, key))
      child[key] = parent[key];
  function ctor() {
    this.constructor = child;
  }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}
function in$(member, list) {
  for (var i = 0, length = list.length; i < length; ++i)
    if (i in list && list[i] === member)
      return true;
  return false;
}
