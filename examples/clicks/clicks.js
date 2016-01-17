Bram.element({
  tag: "click-count",
  template: "#click-template",

  props: ["count"],

  created: function(bind, shadow){
    var clicks = Rx.Observable.fromEvent(shadow.querySelector('button'), 'click');
    Bram.send(this, clicks);

    bind.text(".count", this.count);
  }
});

var count = Bram.mailbox()
  .startWith(0)
  .scan(value => value + 1);

document.querySelector('click-count').count = count;
