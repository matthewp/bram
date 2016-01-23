"use strict";

Bram.element({
  tag: "todo-form",
  template: "#tmpl-todo-form",

  created: function(bind, shadow){
    var form = shadow.querySelector('form');
    var input = form.querySelector('input');
    var submission = Rx.Observable.fromEvent(form, 'submit')
      .map(ev => {
        ev.preventDefault();
        var value = input.value;
        input.value = '';
        return { type: 'add', item: value };
      });

    Bram.send(this, submission);
  }
});

Bram.element({
  tag: "todo-list",
  template: "#tmpl-todo-list",

  props: ["todos"],

  created: function(bind){
    bind.list(this.todos, 'value', '#todos', 'ul', (frag, todo) => {
      frag.querySelector('.todo').textContent = todo.value;

      var deletion = Rx.Observable.fromEvent(frag.querySelector('a'), 'click')
        .map(() => ({ type: 'remove', item: todo }));

      Bram.send(this, deletion);
    });

  }
});

Bram.element({
  tag: "todo-app",
  template: "#tmpl-todo-app",

  created: function(bind){
    var addTodo = (state, item) => ({
      items: state.items.concat({ value: item })
    });
    var removeTodo = (state, item) => ({
      items: state.items.filter(todo => todo.value !== item.value)
    });

  var messages = Bram.listen();

   var state = messages
    .startWith({ items: [{ value: 'Make an app' }] })
    .scan(function(state, ev){
      switch(ev.type) {
        case 'add':
          return addTodo(state, ev.item);
        case 'remove':
          return removeTodo(state, ev.item);
      }
    });

    var todos = state.map(state => state.items);
    this.querySelector('todo-list').todos = todos;

    bind.text('#count', state.map(s => s.items.length));
  }
});
