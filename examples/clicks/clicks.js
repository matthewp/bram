Bram.element({
  tag: "click-count",
  template: "#click-template",

  props: ["count"],

  created: function(bind, shadow){
    var clicks = Rx.Observable
      .fromEvent(shadow.querySelector("button"), "click")
      .startWith(0)
      .scan(value => value + 1)

    bind.text(".count", clicks);
  }
});
