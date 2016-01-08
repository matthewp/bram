Bram.element({
  tag: "user-page",
  template: "#user-template",

  created: function(bind){
    this.first = "";
    this.last = "";

    bind.text("fullName", ".name");

    bind.prop("first", "user-form");
    bind.prop("last", "user-form");
  },

  props: ["first", "last"],

  proto: {
    get fullName() {
      return this.first + " " + this.last;
    }
  }
});

Bram.element({
  tag: "user-form",
  template: "#form-template",

  created: function(bind){
    bind.form("first", "[name=first]", "keyup");
    bind.form("last", "[name=last]", "keyup");
  },

  props: ["first", "last"]
});
