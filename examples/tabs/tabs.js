"use strict";

Bram.element({
  tag: "tab-panel",
  template: "#panel-template",

  created: function(bind){
    var hidden = this.visible.map(visible => !visible);
    bind.hideWhen('.content', hidden);
  },

  props: ["visible"]
});

Bram.element({
  tag: "my-tab",
  template: "#tab-template",

  created: function(bind, shadow){
    var selectedPanel = Rx.Observable.fromEvent(shadow, 'click')
      .filter(ev => ev.target.tagName === 'A')
      .map(ev => ev.target.index)
      .startWith(0);

    var t = shadow.querySelector('#link-template');
    var panels = this.querySelectorAll('tab-panel');
    [].forEach.call(panels, function(panel, i){
      panel.visible = selectedPanel.map(selected => selected === i);

      var clone = document.importNode(t.content, true);
      var a = clone.querySelector('a');
      a.index = i;
      a.textContent = panel.getAttribute('title');
      this.querySelector('.tabs').appendChild(clone);
    }, shadow);
  }
});
