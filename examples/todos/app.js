Bram.element({
  tag: "todo-form",
  template: "#tmpl-todo-form",

  created: function(bind, shadow){
    this.form = shadow.querySelector('form');
  },

  attached: function(){
    this.form.addEventListener('submit', this);
  },

  detached: function(){
    this.form.addEventListener('submit', this);
  },

  proto: {
    handleEvent: function(ev){
      ev.preventDefault();

      var input = this.form.querySelector('input');
      var todo = input.value;
      input.value = '';
      var event = new CustomEvent('todo', {
        bubbles: true,
        detail: todo
      });
      this.dispatchEvent(event);
    }
  }
});

Bram.element({
  tag: "todo-list",
  template: "#tmpl-todo-list",

  setters: {
    todos: function(bind){
      debugger;
    }
  },

 /* proto: {
    get todos() {
      return this._todos;
    },

    set todos(val) {
      this._todos = val;
      this._bindings.list(val, '#todos', 'ul', function(frag, todo){
        frag.querySelector('li').textContent = todo.item;
      });
    }
  }*/
});

var baseTodos = Rx.Observable.from(["Make an app"])
  .map(todo => [{ item: todo }]);

var newTodos = Rx.Observable.fromEvent(document.body, 'todo')
  .map(ev => [{ type: 'new', item: ev.detail }]);

var todos = Rx.Observable
  .merge(newTodos, baseTodos);

todos.subscribe(function(todos){
  console.log("TODOS:", todos);
});

document.querySelector('todo-list').todos = todos;
