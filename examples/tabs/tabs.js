"use strict";

Bram.element({
  tag: "tab-panel",
  template: "#panel-template",

  created: function(bind){
    bind.cond("visible", ".content");
  },

  props: ["visible"]
});

Bram.element({
  tag: "my-tab",
  template: "#tab-template",

  created: function(bind, shadow){
    this.selected = 0;

    let panels = this.querySelectorAll("tab-panel");

    bind.each(panels, "#link-template", function(clone, panel, i){
      let compute = Bram.compute(() => this.selected === i, this);
      bind.prop("visible", panel, compute);

      let title = clone.querySelector(".title");
      title.index = i;
      title.textContent = panel.getAttribute("title");
    });

    let source = Rx.Observable.fromEvent(shadow, "click")
      .filter(ev => ev.target.tagName === "A")
      .map(ev => ev.target.index);

    bind.prop("selected", this, source);
  },

  props: ["selected"]
});
