## Guides

* [Compatibility](./compat.html)
* [Hello World](./hello-world.html)

## What is Bram?

Bram is a small library that aids with writing **custom elements**. Unlike a lot of other user interface libraries, Bram works with [open](https://w3c.github.io/webcomponents/spec/custom/) [standards](https://w3c.github.io/webcomponents/spec/shadow/) and doesn't introduce many new concepts that aren't transferable. Bram merely fills the gaps that web components currently have. For simple components using Bram is already unnecessary. In the future it might be true that Bram isn't needed at all; we welcome such a future!

And because Bram is such a small layer on top of web components, it doesn't require any complex set up to get started; no build scripts or alt-js languages are used. All you need is a browser (we recommend [Chrome](https://www.google.com/chrome/) for development) and a text editor.

## Setting up

Bram can be installed via npm or from [GitHub releases](https://github.com/matthewp/bram/releases). If installing through npm simply do:

```shell
npm install bram --save
```

Bram can also be used via CDN. If using this method just add the script tag:

```html
<script src="https://unpkg.com/bram/bram.umd.js" defer></script>
```

