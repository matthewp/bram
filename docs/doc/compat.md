## Browser Compatibility

Bram targets IE11 and modern browsers. Bram uses several features not available in all browsers, so polyfills need to be provided.

### Proxy

Bram uses [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to make data-binding more elegant. Simply make changes to `this.model` inside of your element and the template will be automatically updated.

Since not all browsers can do this, you need to include the [Proxy polyfill](https://github.com/GoogleChrome/proxy-polyfill). A caveat to the polyfill usage is that all properties should be *predefined* in the constructor. That means instead of doing this:

```js
class MyElement extends Bram.Element {
  setTime() {
    this.model.time = new Date();
  }
}
```

Instead give the property an initial value in your constructor like so:

```js
class MyElement extends Bram.Element {
  constructor() {
    super();
    this.model.time = null;
  }

  setTime() {
    this.model.time = new Date();
  }
}
```

### Map

Bram uses [Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) to keep track of event bindings. We use maps very simply, so a small polyfill like in [this gist](https://gist.github.com/matthewp/81199932db5e1e487a2ea6a15983ac73) is sufficient, but you could also use a more robust polyfill like [es6-shim](https://github.com/paulmillr/es6-shim).

### Mutation Observer
