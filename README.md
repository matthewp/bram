**A WIP, not ready for use**

# Bram

![Bram Stoker](http://i.imgur.com/VaBL9oL.jpg)

Bram is a small library for creating user interfaces. It combines two exciting emerging technologies, [web components](http://webcomponents.org/) and [Observables](https://github.com/zenparsing/es-observable) in a way that is simple to understand.

Bram was born out of the frustration with JavaScript templating today. The popular choices today are Mustache/Handlebars syntax that requires complex data-binding mechanisms or JSX which, while conceptually simpler, necessitates heavy tooling which is leading to [tooling fatigue](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4#.8xz2jmyu2).

Bram defers template binding entirely, in favor of using plain HTML `<template>`s. 
Binding is done in JavaScript with a jQuery-like object.

Communication in Bram happens through observables. Borrowing the [mailbox concept](http://elm-lang.org/blog/announce/0.15#introducing-mailboxes) from Elm, Bram provides a simple way to send messages utilizing a uni-directional data flow.

[![build status](https://img.shields.io/travis/matthewp/bram/master.svg?style=flat-square)](https://travis-ci.org/matthewp/bram)
[![npm version](https://img.shields.io/npm/v/bram.svg?style=flat-square)](https://www.npmjs.com/package/bram)

## Table of Contents

- [Example](#example)
- [Installing](#install)
- [API](https://github.com/matthewp/bram/wiki/API)

## Example

```html
<html>
<head>
  <title>Click counter</title>
</head>
<body>
  <click-count></click-count>

  <template id="click-template">
    <button type="button">Click me</button>

    <h2 class="count"></h2>
  </template>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/rxjs/4.0.7/rx.all.js"></script>
  <script src="node_modules/bram/dist/bram.js"></script>
  <script>
    Bram.element({
      tag: "click-count",
      template: "#click-template",

      props: ["count"],

      created: function(bind, shadow){
        let button = shadow.querySelector('button');
        let clicks = Rx.Observable.fromEvent(button, 'click')
          .map(() => ({ type: 'click' }));
        Bram.send(this, clicks);

        bind.text(".count", this.count);
      }
    });

    let messages = Bram.listen();

    let count = messages
      .filter(ev => ev.type === 'click')
      .startWith(0)
      .scan(value => value + 1);

    document.querySelector('click-count').count = count;
  </script>
</body>
</html>
```

## Install

```shell
npm install bram --save
```

**Or** grab one of [our releases](https://github.com/matthewp/bram/releases).

Bram needs an Observable library. We support the in-progress [Observable spec](https://zenparsing.github.io/es-observable/), so you can use either [a polyfill](https://github.com/zenparsing/zen-observable) or [RxJS](https://github.com/Reactive-Extensions/RxJS). For most non-trivial projects I'd recommend going with RxJS.

Then add the scripts to your page at the end of the `<body>` tag.

```html
<html>
<body>
  <script src="path/to/observable.js"></script>
  <script src="path/to/bram.js"></script>
</body>
</html>
```

## License

BSD 2 Clause
