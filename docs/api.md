# API

- [Bram.element](#bramelementoptions)
- [Bram.listen](#bramlisten)
- [Bram.send](#bramsend)

- [Bram.Binding](#brambinding)
  - [.text()](#brambindingtext)
  - [.value()](#brambindingvalue)
  - [.attr()](#brambindingattr)
  - [.condAttr()](#brambindingcondattr)
  - [.when()](#brambindingwhen)
  - [.hideWhen()](#brambindinghidewhen)
  - [.list()](#brambindinglist)

## Bram.element(options)

```js
Bram.element({
  tag: 'my-element',
  template: '#template-id',

  created: function(){

  }
});
```

### options

Type: `object`

An object with the options used to create your element. The following options are possible:

- [tag](#tag)
- [template](#template)
- [useShadow](#useshadow)
- [props](#props)
- [created](#created)
- [attached](#attached)
- [detached](#detached)
- [proto](#proto)

#### tag

Type: `string`

The tag name for your element.

#### template

Type: `string` or `HTMLTemplateElement`

The element that will be used as the template. Prior to the [created](#created) callback being called, the template will be cloned and appended to the element's shadowRoot (If [useShadow](#useshadow) is `false` it will be appended as a child of the element).

#### useShadow

Type: `boolean`
Default: `true` 

Specifies whether the [template](#template) should be attached to the custom element's `shadowRoot`. By default it will be, but if you are using the [webcomponents-lite](http://webcomponents.org/polyfills/) polyfill that doesn't support Shadow DOM, you'll want to make this false.

The downside is that you cannot use the `<content>` element without Shadow DOM, but for a lot of applications it's simply not needed.

```js
Bram.element({
  tag: 'my-element',
  template: '#my-template',
  useShadow: false // The template will be cloned and attached to the element directly.
});
```

#### props

Type: `Array<string>`

A an array of property names that should be created as Observables. This is useful so that you can set up your application logic in the [created](#created) callback (as you should be) while properties are only added to the element after it has been created. For example:

```js
Bram.element({
  tag: 'my-element',
  template: '#my-template',

  props: ['clicks'],

  created: function(){
    var count = this.clicks
      .startWith(0)
      .scan(val => val + 1);

    count.subscribe(count => console.log("Count:", count));
  }
});

var el = document.createElement('my-element');

// Pass in an observable as the **clicks** property.
el.clicks = Rx.Observable.from([1, 2, 3]);
```

Will produce:

```
Count: 1
Count: 2
Count: 3
```

#### created

Type: `function`

Param: [bind](#brambinding)
Param: shadow (DocumentFragment)

Represents a callback that will be called when the element is created, such as via `document.createElement('my-element')`. If the element is already statically in the page the **created** callback will still be called as the page loads.

Of the three lifecycle callbacks, created, attached, and detached, created is the most important and is where you will want to set up the logic of your element. Here's an example usage:

```js
Bram.element({
  tag: "time-counter",
  template: "#some-template",

  created: function(bind, shadow){
    var clock = Rx.Observable
      .interval(500)
      .startWith(new Date().getTime())
      .scan(function(date){
        return date + 500;
      })
      .map(function(v){
        return new Date(v + 1000);
      });

    bind('.time').text(clock);
  }
});
```

This `clock` observable will change every 500ms with the current time. The **bind** argument provided to created is a [Bram.binding](#brambinding) object that is used to bind an observable to an element contained within your custom element.

#### attached

Type: `function`

A lifecycle callback that is called when the element is attached to the DOM, such as when it is inserted.

```js
var el = document.createElement('my-element'); // created called
document.body.appendChild(el); // attached called
```

#### detached

Type: `function`

A lifecycle callback that is called when the element is detached (removed) from the DOM.

```js
var el = document.querySelector('my-element');
el.parentNode.removeChild(el); // detached called
```

#### proto

Type: `object`

Represents your custom element's **prototype**. Add any functions or getter/setters here that you would like to be exposed, essentially representing your element's public API.

```js
Bram.element({
  tag: 'color-chooser',
  template: '#color-template',

  proto: {
    get color() {
      return this.getAttribute('color') || 'blue'; // default to blue
    }
  }
});

document.createElement('color-chooser').color; // -> blue
```

## Bram.listen

Creates an Observable that will receive any global events emitted. Use this as your central event bus, deriving specific properties and/or a global application state based on this. For example:

```js
var events = Bram.listen();

var notifications = events.filter(ev => ev.type === 'notification');
var todos = events.filter(ev => ev.type === 'todo');

Bram.element({
  tag: 'notification-center',
  template: '#some-template',

  create: function(){
    var notificationEvent = Rx.Observable.fromPromise(getNotifications())
      .map(data => ({ type: 'notification', data: data }));

    Bram.send(this, notificationEvent);
  }
});

Bram.element({
  tag: 'todo-form',
  template: '#some-todos',

  created: function(bind, shadow) {
    var el = shadow.querySelector('#add-todo');
    var addTodos = Rx.Observable.fromEvent(el, 'click')
      .map(() => ({ type: 'todo', text: 'some todo' }));

    Bram.send(this, addTodos);
  }
});
```

## Bram.Binding

Type: `function`

**Bram.Binding** is an object that is used to connect DOM elements to observables so that any changes to the observable will reflect in the DOM element. This allows us to use plain, static, `<template>` elements without strange binding syntax.

Instead binding takes place in the [created](#created) callback. The first argument of created is a function that creates Bram.Binding objects:

```js
Bram.element({
  tag: 'my-element',
  template: '#some-template',
  created: function(bind) {
    var name = Rx.Observable.from('Bram');

    bind('.name').text(name);
  }
});
```

In this example the name observable is bound to the `.name` selector that is a child of the element.

### Bram.Binding#text

Type: `function`

Bind an observable to an element's textContent:

```js
bind('.name').text(nameObservable);
```

### Bram.Binding#value

Type: `function`

Bind an observable to an element's `value` (such as input elements).

```js
bind('.name').value(nameObservable);
```

### Bram.Binding#attr

Type: `function`

Binds an attribute's value to an Observable.

```js
var color = Rx.Observable.just('blue')
  .map(value => `color:${value};`);

bind('.name').attr('style', color);
```

This sets the element's style attribute to `color:blue;`.

### Bram.Binding#condAttr

Type: `function`

Sets a boolean attribute when an observable is truthy.

```js
var toggle = Rx.Observable.fromEvent(button, 'click')
  .scan(value => !value)
  .startWith(true);

bind('input').condAttr('hidden', toggle);
```

This will add the `hidden` attribute when `toggle`'s value is true and remove the attribute when `toggle`'s value is false. Each time the button is clicked the value is changed.

### Bram.Binding#when

Type: `function`

Param: Observable

Param: String|HTMLTemplateElement

Param: `function`

Apply clone and insert a template whenever an observable is truthy.

```html
<template id="name-template">
  <span class="first"></span>
</template>
```

```js
var firstName = Rx.Observable.just('Matthew');
var showName = Rx.Observable.just(true);

bind('.name').when(showName, '#name-template', function(bind){
  bind('.first').text(firstName);
});
```


### Bram.Binding#hideWhen

Type: `function`

Hides an element when an Observable's value is truthy. Use this to hide a section of HTML. If you want to prevent the HTML from being created then use [.when()](#brambindingwhen) instead.

The [tabs example](https://github.com/matthewp/bram/blob/master/examples/tabs/tabs.js#L9) shows usage of hideWhen.

### Bram.Binding#list

Type: `function`

Param: Observable

Param: Object (options)

Param: `function` (callback)

Bind a list to an element using a template for each item in the list. Given a **key** this will make the minimal changes needed to update the DOM.

```html
<template id="person">
  <li>
    <span class="first"></span>
    <span class="last"></span>
  </li>
</template>

<ul class="people"></ul>
```

```js
var people = Rx.Observable.just([
  { id: 1, first: 'Bram', last: 'Stoker' },
  { id: 2, first: 'Mary', last: 'Shelley' },
  { id: 3, first: 'Gaston', last: 'Leroux' }
]);

bind('.people').list(people, {
  template: '#person',
  key: 'id'
}, function(el, person){
  el.querySelector('.first').textContent = person.first;
  el.querySelector('.last').textContent = person.last;
});
```
