Bram.element({
  tag: "click-count",
  template: "#click-template",

  created: function(bind, shadow){
    this.count = 0;
    bind.text("count", ".count");

    var clicks = Rx.Observable
      .fromEvent(shadow.querySelector("button"), "click")
      .startWith(0)
      .scan(value => value + 1)

    bind.prop("count", this, clicks);
  },

  props: ["count"]
});
