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
  <script src="node_modules/bram/bram.umd.js"></script>
</head>
<body>
  <click-count></click-count>

  <template id="click-template">
    <button type="button" on-click="increment">Click me</button>

    <h1>Clicks: {{count}}</h1>
  </template>
  
  <script>
    class ClickCount extends Bram.Element {
      static get template() {
        return '#click-template';
      }
      
      constructor() {
        super();
        this.model.count = 0;
      }

      increment() {
        this.model.count++;
      }
    }

    customElements.define('click-count', ClickCount);
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
  <script src="path/to/bram.umd.js"></script>
</body>
</html>
```

## API

### Bram.Element

The primary base class for extending elements. Deriving your classes from **Bram.Element** gives you templating, observable models and more.

```js
class MyWidget extends Bram.Element {

}
```

If using the ES6 build you can do either of these:

```js
import Bram from './path/to/bram.js';


class MyWidget extends Bram.Element {

}
```

or

```js
import { Element } from './path/to/bram.js';

class MyWidget extends Element {

}
```

#### Bram

Additionally **Bram** is a function that takes an element and returns an extended version. This can be used to extend elements other than HTMLElement:

```js
class FancyButton extends Bram(HTMLButtonElement) {

}
```

#### template

The static getter **template** is used if you want to render a template to your element. You can return either a selector like:

```js
class MyWidget extends Bram.Element {
  static get template() {
    return '#my-template';
  }
}
```

Or the template element itself:

```js
const myTemplate = document.querySelector('#my-template');

class MyWidget extends Bram.Element {
  static get template() {
    return myTemplate;
  }
}
```

#### renderMode

By default Bram renders to the element's `shadowRoot`, but you can change this if you don't want to use Shadow DOM. You might do this if you don't want to add the Shadow DOM polyfill, or your element depends on global styles.

```js
class MyWidget {
  static get renderMode() {
    return 'light';
  }
}
```

Valid options are:

* **shadow** (the default) renders to the Shadow DOM. You never need to add this unless you just want to be explicit.
* **light** renders to the element itself (the template becomes a child).

#### events

Specify custom events that your element emits. Bram will set up `onevent` properties for each of these events, as is common with most built in elements. This also will make your component compatible with React, see [this thread](https://github.com/facebook/react/issues/7901).

```js
class UserForm extends Bram.Element {
  static get events() {
    return ['namechanged']
  }

  ...

  changeName(newName) {
    this.name = newName;
    this.dispatchEvent(new CustomEvents('namechanged', {
      detail: newName
    }));
  }
}

customElements.define('user-form', UserForm);

let form = new UserForm();
form.onnamechanged = function(ev){
  // This is called when the user's name changes
  console.log(ev.detail);
};
```

### templating

#### Conditionals

To conditionally render, use an **if** attribute on an inner template.

```html
<template id="user-template">
  <h1>User {{name}}</h1>

  <template if="{{isAdmin}}"> 
    <h2>Admin section</h2>
  </template>
</template>

<user-page></user-page>
```

Any time `isAdmin` changes value, the template will either be removed or readded.

```js
class UserPage extends Bram.Element {
  static get template() {
    return '#user-template';
  }

  constructor() {
    // Not an admin by default
    this.model.isAdmin = false;
  }

  set isAdmin(val) {
    this.model.isAdmin = !!val;
  }
}

customElements.define('user-page', UserPage);

let page = new UserPage();
document.body.appendChild(page);

page.isAdmin = true; // Admin section is shown.

page.isAdmin = false; // Admin section is removed.
```

#### Looping over arrays

To loop over an array use an inner template with the **each** attribute. Like so:

```html
<template id="player-template">
  <h2>Volleyball players</h2>

  <ul>
    <template each="{{players}}">
      <li>
        {{name}}
      </li>
    </template>
  </ul>
</template>

<player-list></player-list>
```

Rendered with this data:

```js
class PlayerList extends Bram.Element {
  static get template() {
    return '#player-template';
  }

  constructor() {
    this.model.players = [
      { name: 'Matthew' },
      { name: 'Anne' },
      { name: 'Wilbur' }
    ];
  }
}

customElements.define('player-list', PlayerList);
```

Will show all three players as separate `<li>` elements.

#### Properties

You can set properties on an element using the special colon character like `:foo` on attributes. This allows you to pass non-string data to elements.

```html
<template id="foo-template">
  <div :foo="{{foo}}">Foo!</div>
</template>

<foo-el></foo-el>
```

```js
class Foo extends Bram.Element {
  static get template() {
    return '#foo-template';
  }

  constructor() {
    this.model.foo = 'bar';
  }
}

customElements.define('foo-el', Foo);
```

Will render the `<div>` and set its `foo` property to the string `"bar"`.

### Bram.model

Use **Bram.model** to create an observable model for use with your templates. If using a browser that doesn't supports [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) you must pass in initial values for all of your properties so that they can be observed.

```js
var model = Bram.model();

// The template will know about this change.
model.foo = 'bar';
```

### Bram.onChildren

Use **Bram.onChildren** to be notified when your element has received children. This allows you to write more resilent custom elements that take into account the dynamic nature of HTML in the case where you have special behavior depending on children.

```js
class SortableList extends HTMLElement {
  connectedCallback() {
    this.unlisten = Bram.onChildren(this, children => {
      // children is a NodeList
      this.sort();
    });
  }

  disconnectedCallback() {
    // removes the event listener created in connectedCallback
    this.unlisten();
  }

  sort() {
    // Perform some kind of sorting operation
    var childNodes = this.childNodes;
  }
}

customElements.define('sortable-list', SortableList);
```

## License

[BSD 2-Clause](https://opensource.org/licenses/BSD-2-Clause)
