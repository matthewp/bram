"use strict";

class TodoForm extends HTMLElement {
  createdCallback() {
    this.hydrate = Bram.template(document.querySelector('#tmpl-todo-form'));
  }

  attachedCallback() {
    var tree = this.hydrate();
    this.appendChild(tree);
    this.input = document.querySelector('input');

    this.querySelector('form').addEventListener('submit', this);
  }

  detachedCallback() {
    this.querySelector('form').removeEventListener('submit', this);
  }

  handleEvent(ev) {
    ev.preventDefault();

    var newEvent = new CustomEvent('new-todo', {
      bubbles: true,
      detail: this.input.value
    });
    this.dispatchEvent(newEvent);
  }
}

document.registerElement('todo-form', TodoForm);

class TodoList extends HTMLElement {
  createdCallback() {
    this.hydrate = Bram.template(document.querySelector('#tmpl-todo-list'));
    this.model = Bram.model({
      todos: []
    });
  }

  attachedCallback() {
    var tree = this.hydrate(this.model);
    this.appendChild(tree);
  }

  get todos() {
    return this.model.todos;
  }
}

document.registerElement('todo-list', TodoList);

class TodoApp extends HTMLElement {
  attachedCallback() {
    this.todoList = this.querySelector('todo-list');

    this.addEventListener('new-todo', this);
  }

  detachedCallback() {
    this.removeEventListener('new-todo', this);
  }

  handleEvent(ev) {
    var newTodo = ev.detail;
    this.todoList.todos.push(newTodo);
  }
}

document.registerElement('todo-app', TodoApp);

/*
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
    bind('ul').list(this.todos, {
      template: '#todos',
      key: 'value',
    }, (frag, todo) => {
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

    bind('#count').text(state.map(s => s.items.length));
  }
});
*/
