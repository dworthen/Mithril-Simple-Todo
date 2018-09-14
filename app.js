/**
 * todoModel = { text: string, done: boolean}
 * Start with empty list
 */
var TodosModel = {
  currentId: 0,
  todos: [],

  toggle: function(id) {
    var ind = TodosModel.findTodoIndex(id);
    console.log(ind);
    if (ind > -1) {
      TodosModel.todos[ind].done = !TodosModel.todos[ind].done;
    }
  },

  add(todo) {
    if (!todo || !todo.text) return;
    TodosModel.currentId++;
    todo.id = TodosModel.currentId;
    TodosModel.todos.push(todo);
  },

  delete(id) {
    var ind = TodosModel.findTodoIndex(id);
    console.log(ind);
    if (ind > -1) {
      TodosModel.todos.splice(ind, 1);
    }
  },

  clearDone: function() {
    var todos = TodosModel.todos;
    for (var i = todos.length - 1; i > -1; i--) {
      if (todos[i].done) {
        TodosModel.todos.splice(i, 1);
      }
    }
  },

  findTodoIndex: function(id) {
    return TodosModel.todos.findIndex(function(el) {
      return el.id === id;
    });
  }
};

var Todo = {
  oninit: function(vnode) {
    this.todo = vnode.attrs.todo;
  },
  view: function(vnode) {
    var todo = this.todo;
    return m("li", { class: todo.done ? "done" : "" }, [
      m("input[type='checkbox']", {
        checked: todo.done,
        onchange: TodosModel.toggle.bind(this, todo.id)
      }),
      " ",
      todo.text,
      " ",
      m("button", { onclick: TodosModel.delete.bind(this, todo.id) }, "X")
    ]);
  }
};

var Todos = {
  view: function(vnode) {
    return m(
      "ul",
      vnode.attrs.todos.map(function(todo, ind) {
        return m(Todo, { todo: todo, key: todo.id });
      })
    );
  }
};

var Add = {
  oninit: function(vnode) {
    this.text = "";
  },
  changed: function(e) {
    this.text = e.target.value;
  },
  add: function(e) {
    e.preventDefault();
    TodosModel.add({ text: this.text, done: false });
    this.text = "";
  },
  view: function(vnode) {
    return m("form", { onsubmit: this.add.bind(this) }, [
      m("input[type='text']", {
        value: this.text,
        oninput: this.changed.bind(this)
      }),
      " ",
      m("button[type='submit']", "Add Todo")
    ]);
  }
};

var Clear = {
  view: function() {
    return m("button", { onclick: TodosModel.clearDone }, "Clear Done");
  }
};

var App = {
  view: function(vnode) {
    return m("div", [
      !!TodosModel.todos.length
        ? m(Todos, { todos: TodosModel.todos })
        : m("div", "All Done! Nothing to see here."),
      m(Add),
      m(Clear)
    ]);
  }
};

m.mount(document.body, App);
