## Hello World!

This example is available via [this codepen](http://codepen.io/matthewp/pen/dNybdG?editors=1010). Fork it and experiment!

Most of Bram is concerned with taking a template, defined in a `<template>` tag, and rendering it with some data, that we call an element's **model**.

First, let's start by creating a simple template. We're giving it an id of `hello` so that we can refer to it later.

```html
<template id="hello">
  <h1>Hello {{name}}!</h1>
</template>
```

Notice the double curly braces. If you've ever used [mustache](https://mustache.github.io/) or [handlebars](http://handlebarsjs.com/) templates then this is probably familiar to you.

The curly braces signify a *binding* to the element's model. Every custom element defined in Bram has a **model** property that is used to render the template. Anything added to the model; strings, numbers, objects, or arrays, are observed for changes which will result in the template automatically being updated.

To create the custom element use this JavaScript:

```js
class HelloWorld extends Bram.Element {
  static get template() {
    return '#hello';
  }
  
  constructor() {
    super();
    this.model.name = this.getAttribute('name');
  }
}

customElements.define('hello-world', HelloWorld);
```

Notice that the constructor sets the model's `name` property to the value of the *name* attribute. 

The second thing to notice is that the class definition includes `static get template()`. This is a static getter that defines the element's template. Here you can return a [selector](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Selectors) (as happens in this example), or a [template element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).

When looking at this example in devtools you'll see this:

![screen shot 2017-01-03 at 7 51 10 am](https://cloud.githubusercontent.com/assets/361671/21608260/71d9daaa-d189-11e6-92d3-8134fc20d25e.png)

Notice that the `<h1>` is nested inside of a special section called *#shadow-root*. This is because Bram, by default, renders templates inside of a [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM). Think of the shadow DOM like a private area just for your element. Others *can* poke inside and see what's going on, but only if they really try.

One cool property of shadow DOM is that global styles don't leak in. This means your styles are completely encapsulated. Some times you might *not* want to render to the shadow DOM, but rather to the element's direct children. We call that the **light DOM**.  You can toggle this by setting the `static get renderMode()` property like so:

```js
class MyElement extends Bram.Element {
  static get renderMode() {
    return 'light';
  }
}
```
