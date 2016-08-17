# Bram

![Bram Stoker](http://i.imgur.com/VaBL9oL.jpg)

Bram is a small utility for building user interfaces using [web components](http://webcomponents.org/). Unlike other libraries in this space, Bram is not a framework and instead encourages you to use the browser's own apis. Today Bram provides observable models and simple templates.

[![build status](https://img.shields.io/travis/matthewp/bram/master.svg?style=flat-square)](https://travis-ci.org/matthewp/bram)
[![npm version](https://img.shields.io/npm/v/bram.svg?style=flat-square)](https://www.npmjs.com/package/bram)

## Table of Contents

- [Example](#example)
- [Installing](#install)
- [API](#api)

## Example

```html
<!doctype html>
<html>
<head>
  <title>Click counter</title>
</head>
<body>
  <click-count></click-count>

  <template id="click-template">
    <button type="button">Click me</button>

    {{count}}
  </template>
  <script src="node_modules/bram/bram.js"></script>
  <script>
    class ClickCount extends HTMLElement {
      createdCallback() {
        this.hydrate = Bram.template(template);
        this.model = Bram.model({
          count: 0
        });
      }

      attachedCallback() {
        var tree = this.hydrate(this.model);
        this.appendChild(tree);

        this.querySelector('button').addEventListener('click', this);
      }

      detachedCallback() {
        this.querySelector('button').removeEventListener('click', this);
      }

      handleEvent(ev){
        this.count++;
      }

      get count() {
        return this.model.count;
      }

      set count(val){
        this.model.count = val;
      }
    }

    document.registerElement('click-count', ClickCount);
  </script>
</body>
</html>
```

## Install

Using npm:

```shell
npm install bram --save
```

Using bower:

```shell
bower install bram --save
```

**Or** grab one of [our releases](https://github.com/matthewp/bram/releases).

Then add the scripts to your page at the end of the `<body>` tag.

```html
<html>
<body>
  <script src="path/to/bram.js"></script>
</body>
</html>
```

## API

### Bram.template

Given a `<template>` element, creates a function that can be called to render the template based on some model (using Bram.model, below).

Templates support the magic tag `{{` and `}}` that should be familiar if you've used Mustache or Handlebars. A template might look like:

```html
<template>
  <span>Hello {{name}}</span>
</template>
```

When can be rendered like:

```js
var render = Bram.template(document.querySelector('template'));
var model = Bram.model();

document.body.appendChild(render(model));

model.name = 'World!';
```

Which will cause the page to display "Hello World!". The model can be modified at any time and the live-binding will cause the page to be updated to reflect those changes.

#### Conditionals

Bram templates support conditionals using inner templates with an `if` attribute like so:

```html
<template>
  <h1>User {{name}}</h1>

  <template if="{{isAdmin}}">
    <h2>Admin stuff here</h2>
  </template>

</template>
```

In this example, the inner template will be rendered only if `isAdmin` resolves to a truthy value.

#### Looping over arrays

To loop over an array use an inner template with the `each` attribute. Like so:

```html
<template>
  <h2>Volleyball players</h2>

  <ul>
    <template each="{{players}}">
      <li>
        {{name}}
      </li>
    </template>
  </ul>
</template>
```

Rendered with this data:

```js
var render = Bram.template(document.querySelector('template'));
var model = Bram.model({
  players: [
    { name: 'Matthew' },
    { name: 'Anne' },
    { name: 'Wilbur' }
  ]
});

document.body.appendChild(render(model));
```

Will show all three players as separate `<li>` elements.

### Bram.model

Use **Bram.model** to create an observable model for use with your templates. If using a browser that doesn't supports [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) you must pass in initial values for all of your properties so that they can be observed.

```js
var model = Bram.model();

// The template will know about this change.
model.foo = 'bar';
```

## License

[BSD 2-Clause](https://opensource.org/licenses/BSD-2-Clause)
