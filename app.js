var TodosModel = {
  currentId: 0,
  todos: [],
  selected: "all",
  allChecked: false,

  getAllTodos: function() {
    return TodosModel.todos;
  },

  getActiveTodos: function() {
    return TodosModel.todos.filter(function(el) {
      return !el.done;
    });
  },

  getCompletedTodos: function() {
    return TodosModel.todos.filter(function(el) {
      return el.done;
    });
  },

  toggle: function(id) {
    var ind = TodosModel.findTodoIndex(id);
    console.log(ind);
    if (ind > -1) {
      TodosModel.todos[ind].done = !TodosModel.todos[ind].done;
    }
  },

  checkAll: function() {
    TodosModel.todos = TodosModel.todos.map(function(el) {
      el.done = true;
      return el;
    });
  },

  unCheckAll: function() {
    TodosModel.todos = TodosModel.todos.map(function(el) {
      el.done = false;
      return el;
    });
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
    TodosModel.allChecked = false;
  },

  findTodoIndex: function(id) {
    return TodosModel.todos.findIndex(function(el) {
      return el.id === id;
    });
  }
};

var Checkmark = {
  view: function(vnode) {
    var checked = vnode.attrs.checked;
    return m("label.checkmark-container.fl", [
      m("input[type='checkbox'].checkmark-checkbox.mr4", {
        checked: checked,
        onchange: vnode.attrs.changeFn // TodosModel.toggle.bind(this, todo.id)
      }),
      m(
        "span.checkmark.ma2.bg-washed-blue.hover-bg-light-blue.ba.bw1.b--black-10"
      )
    ]);
  }
};

var Todo = {
  oninit: function(vnode) {
    this.todo = vnode.attrs.todo;
  },
  view: function(vnode) {
    var todo = this.todo;
    var classes = classNames({
      strike: todo.done,
      "moon-gray": todo.done,
      cf: true,
      pa2: true,
      "bg-white": true,
      "shadow-5": true
    });
    return m("div", { class: classes }, [
      m(Checkmark, {
        checked: todo.done,
        changeFn: TodosModel.toggle.bind(this, todo.id)
      }),
      m("span.f2.fw2", [todo.text]),
      m(
        "div.fr.f2.fw6.mr2.washed-red.hover-light-red.pointer",
        { onclick: TodosModel.delete.bind(this, todo.id) },
        "X"
      )
    ]);
  }
};

var Todos = {
  view: function(vnode) {
    return m(
      "div",
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
    var inputClasses = classNames({
      "clean-input": true,
      "input-reset": true,
      db: true,
      "w-80": false,
      fr: true,
      mh2: false,
      mv2: true,
      f3: true,
      fw2: true,
      pv1: true,
      "lh-copy": true,
      "bg-near-white": true
    });
    var divClasses = classNames(
      "pa2",
      "bg-near-white",
      "shadow-5",
      "bb",
      "bw1",
      "b--moon-gray",
      "cf"
    );
    return m("div", { class: divClasses }, [
      m(Checkmark, {
        checked: TodosModel.allChecked,
        changeFn: function() {
          if (TodosModel.allChecked) {
            TodosModel.unCheckAll();
          } else {
            TodosModel.checkAll();
          }
          TodosModel.allChecked = !TodosModel.allChecked;
        }
      }),
      m("form", { onsubmit: this.add.bind(this) }, [
        m("input[type='text']", {
          placeholder: "What needs to be done?",
          autofocus: true,
          class: inputClasses,
          value: this.text,
          oninput: this.changed.bind(this)
        })
      ])
    ]);
  }
};

var All = {
  view: function(vnode) {
    return m(
      ".fl.pointer.pa2.mh2.ba.b--black-10",
      {
        onclick: function() {
          TodosModel.selected = "all";
        }
      },
      TodosModel.getAllTodos().length + " All"
    );
  }
};

var Active = {
  view: function(vnode) {
    return m(
      ".fl.pointer.pa2.mh2.ba.b--black-10",
      {
        onclick: function() {
          TodosModel.selected = "active";
        }
      },
      TodosModel.getActiveTodos().length + " Active"
    );
  }
};

var Completed = {
  view: function(vnode) {
    return m(
      ".fl.pointer.pa2.mh2.ba.b--black-10",
      {
        onclick: function() {
          TodosModel.selected = "completed";
        }
      },
      TodosModel.getCompletedTodos().length + " Completed"
    );
  }
};

var ClearCompleted = {
  view: function() {
    return m(
      ".fr.pa2.pointer",
      { onclick: TodosModel.clearDone },
      TodosModel.getCompletedTodos().length ? "Clear Completed" : ""
    );
  }
};

var Footer = {
  view: function(vnode) {
    var divClasses = classNames(
      "ph2",
      "pt3",
      "pb2",
      "bg-white",
      "shadow-5",
      "cf"
    );
    return m("div", { class: divClasses }, [
      m(All),
      m(Active),
      m(Completed),
      m(ClearCompleted)
    ]);
  }
};

var ShowChildren = {
  view: function(vnode) {
    return m("span", [!vnode.attrs.show ? "" : vnode.children]);
  }
};

var App = {
  view: function(vnode) {
    var todos =
      TodosModel.selected === "active"
        ? TodosModel.getActiveTodos()
        : TodosModel.selected === "completed"
          ? TodosModel.getCompletedTodos()
          : TodosModel.getAllTodos();
    return m("div", [
      m(Add),
      m(ShowChildren, { show: !!TodosModel.todos.length }, [
        m(Todos, { todos: todos }),
        m(Footer)
      ])
      // !!TodosModel.todos.length ? m(Todos, { todos: todos }) : ""
      // m(Clear)
    ]);
  }
};

m.mount(document.getElementById("app"), App);
