**A WIP, not ready for use**

# Bram

Web component architecture with Observables.

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
        let clicks = Rx.Observable.fromEvent(button, 'click');
        Bram.send(this, clicks);

        bind.text(".count", this.count);
      }
    });

    let count = Bram.mailbox()
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

## License

BSD 2 Clause
