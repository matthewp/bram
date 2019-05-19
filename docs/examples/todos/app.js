import Bram from '../../../bram.js';

class ViewModel {
  constructor() {
    this.todos = [];
  }
  addTodo(ev) {
    ev.preventDefault();
    let input = ev.target.todo;
    let value = input.value;
    this.todos.push(value);
    input.value = '';
  }
}

const template = document.querySelector('#todo-template');

class TodoList extends Bram.Element {
  constructor() {
    super();
    this.attachView(template, new ViewModel());
  }
}

customElements.define('todo-list', TodoList);
