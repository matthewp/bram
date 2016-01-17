Bram.element({
  tag: "user-page",
  template: "#user-template",

  created: function(bind){
    var mailbox = Bram.mailbox();

    var first = mailbox.filter(ev => ev.type === 'first')
      .map(ev => ev.value)
      .startWith("");

    var last = mailbox.filter(ev => ev.type === 'last')
      .map(ev => ev.value)
      .startWith("");

    var form = this.querySelector('user-form');
    form.first = first;
    form.last = last;

    var fullName = Rx.Observable.combineLatest(first, last, (first, last) => {
      return first + ' ' + last;
    });
    bind.text('.name', fullName);
  }
});

Bram.element({
  tag: "user-form",
  template: "#form-template",

  created: function(bind, shadow){
    var firstEl = shadow.querySelector("[name=first]");
    var first = Rx.Observable.fromEvent(firstEl, "keyup")
      .map(ev => ({ type: 'first', value: ev.target.value }));

    var lastEl = shadow.querySelector("[name=last]");
    var last = Rx.Observable.fromEvent(lastEl, "keyup")
      .map(ev => ({ type: 'last', value: ev.target.value }));

    Bram.send(this, first);
    Bram.send(this, last);
  },

  props: ["first", "last"]
});
