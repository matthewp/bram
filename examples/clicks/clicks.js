Bram.element({
  tag: "click-count",
  template: "#click-template",

  props: ["count"],

  created: function(bind, shadow){
    var clicks = Rx.Observable.fromEvent(shadow.querySelector('button'), 'click')
      .map(() => ({ type: 'click' }));
    Bram.send(this, clicks);

    bind(".count").text(this.count);
  }
});

var messages = Bram.listen();

var count = messages
  .filter(ev => ev.type === 'click')
  .startWith(0)
  .scan(value => value + 1);

document.querySelector('click-count').count = count;
