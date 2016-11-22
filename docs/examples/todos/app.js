class TodoList extends Bram.Element {
  static get template() {
    return '#todo-template';
  }

  constructor() {
    super();
    this.model.todos = [];
  }

  addTodo(ev) {
    ev.preventDefault();
    let input = ev.target.todo;
    let value = input.value;
    this.model.todos.push(value);
    input.value = '';
  }
}

customElements.define('todo-list', TodoList);
