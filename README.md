# Bram

![Bram Stoker](http://i.imgur.com/VaBL9oL.jpg)

Bram is a 3k [web components](http://webcomponents.org/) library with everything you need to build reactive user interfaces. Bram embraces ES2015, the `<template>` element, and [Proxys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

[![build status](https://img.shields.io/travis/matthewp/bram/master.svg?style=flat-square)](https://travis-ci.org/matthewp/bram)
[![npm version](https://img.shields.io/npm/v/bram.svg?style=flat-square)](https://www.npmjs.com/package/bram)

## Table of Contents

- [Example](#example)
- [Installing](#install)
- [API](#api)

## Example

```html
<!doctype html>
<html lang="en">
<title>Click counter</title>

<click-count></click-count>

<template id="click-template">
  <button type="button" @click="{{increment}}">Click me</button>

  <h1>Clicks: {{count}}</h1>
</template>

<script type="module">
  import Bram from 'https://unpkg.com/bram/bram.js';

  const template = document.querySelector('#click-template');

  class ClickCount extends Bram.Element {
    constructor() {
      super();
      this.model = this.attachView(template, {
        count: 0,
        increment() { this.count++; }
      });
    }
  }

  customElements.define('click-count', ClickCount);
</script>
```

## Install

Using npm:

```shell
npm install bram --save
```

**Or** grab one of [our releases](https://github.com/matthewp/bram/releases).

## API

### Bram.Element

The primary base class for extending elements. Deriving your classes from **Bram.Element** gives you templating and models.

You can either use `Bram.Element` on the default export:

```js
import Bram from './path/to/bram.js';


class MyWidget extends Bram.Element {

}
```

or use the `Element` export directly. These are the same.

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

#### attachView

A __view__ is live-bound DOM that responds to changes to, and emits events on, a *model*. Use `attachView()` to create a view on your element's `shadowRoot` based on a template.

```js
const template = document.querySelector('#my-template');

class MyWidget extends Bram.Element {
  constructor() {
    super();
    this.attachView(template, {
      foo: 'bar'
    });
  }
}
```

##### Arguments

* __template__: An [HTMLTemplateElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement) that follows the templating syntax described below.
* __viewModel__: An object that is used to look up values from the template. If no viewModel is provided an empty object is used.

##### Return value

* __model__: A [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to the *viewModel* passed as an argument. Modifying properties on this object will result in the view updating.

```html
<template id="nameTemplate">
  <label for="name">Name</label>
  <input name="name" type="text" @input="{{setName}}">

  <h2>{{name}}</h2>
</template>

<script type="module">
  import Bram from 'https://unpkg.com/bram/bram.js';

  customElements.define('name-change', class extends Bram.Element {
    constructor() {
      super();
      this.model = this.attachView(nameTemplate, {
        name: 'default',
        setName: ev => {
          this.model.name = ev.target.value
        }
      });
    }
  });
</script>
```

`attachView()` will always render into the shadowRoot. If no shadowRoot has been created, one will be created with `{ mode: 'open' }` as the shadow options.

Note that the *model* object is not set on the element instance. You can set it to any property you want (or not at all if its not needed). Here's an example that uses JavaScript private syntax to protect access to the model:

```js
class MyElement extends Bram.Element {
  constructor() {
    super();
    this.#model = this.attachView(someTemplate);
  }

  set prop(val) {
    this.#model.prop = val;
  }
}
```

One pattern that is useful with `attachView()` is to have a separate class that serves as your view model. This allows you to encapsulate everything the template needs in one place, without including that on the element itself (which would expose properties/methods to users of the element that are in actuality internal).

```js
class ViewModel {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;
  }
}

class CounterElement extends Bram.Element {
  constructor() {
    super();
    this.attachView(template, new ViewModel());
  }
}
```

#### childrenConnectedCallback

The **childrenConnectedCallback** is a callback on the element's prototype. Use this to be notified when your element has received children. This allows you to write more resilient custom elements that take into account the dynamic nature of HTML in the case where you have special behavior depending on children.

```js
class SortableList extends Bram.Element {
  childrenConnectedCallback() {
    this.sort();
  }

  sort() {
    // Perform some kind of sorting operation
    let children = this.children;
  }
}

customElements.define('sortable-list', SortableList);
```

### Templating

One of Bram's biggest advantages is its declarative template syntax with automatic binding.

Each `Bram.Element` contains an object called `this.model` which drives the template. Any changes to `this.model`, whether they change a property, add a new property, remove a property, or reorder an Array, will result in the template being updated to reflect those changes.

Bram's templates support conditionals and loops, and allow declarative binding on *properties*, *attributes*, *text*, and *events*.

#### Conditionals

To conditionally render, use an **if** attribute on an inner template.

```html
<template id="user-template">
  <h1>User {{name}}</h1>

  <template if="isAdmin">
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
    <template each="players">
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

#### Events

Events can be assigned to an element using the `on-` notation on attributes. This example handle a form being submitted:

```html
<template id="user-form">
  <form on-submit="handleSubmit">
    <input name="user-name" placeholder="Your name">
  </form>
</template>

<user-form></user-form>
```

This will call the `handleSubmit` method on the user-form element:

```js
class UserForm extends Bram.Element {
  static get template() {
    return '#user-form';
  }

  handleSubmit(ev) {
    ev.preventDefault();

    // User fetch() or something instead
  }
}

customElements.define('user-form', UserForm);
```

### Bram.template

Creates a function that is used to hydrate (render) a template using a set of data.

```js
let hydrate = Bram.template('#some-template');
let link = hydrate({foo: 'bar'});

document.body.appendChild(link.tree);
```

Hydrating creates a *link* object which holds the data-bindings and the rendered DocumentFragment (the `.tree` property).

## License

[BSD 2-Clause](https://opensource.org/licenses/BSD-2-Clause)
