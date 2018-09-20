var TodosModel = {
  currentId: 0,
  todos: [],
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
      m("input[type='checkbox'].checkmark-checkbox", {
        checked: checked,
        onchange: vnode.attrs.changeFn // TodosModel.toggle.bind(this, todo.id)
      }),
      m("span.checkmark.bg-washed-blue.hover-bg-light-blue.ba.bw1.b--black-10")
    ]);
  }
};

var TextField = {
  view: function(vnode) {
    var todo = vnode.attrs.todo;
    var classes = classNames({
      strike: todo.done,
      "moon-gray": todo.done
    });
    return [
      m("span.f2.fw2", { class: classes }, [todo.text]),
      m(
        "div.fr.f2.fw6.mr2.washed-red.hover-light-red.pointer",
        { onclick: TodosModel.delete.bind(this, todo.id) },
        "X"
      )
    ];
  }
};

var Todo = {
  view: function(vnode) {
    var todo = vnode.attrs.todo;
    return m(".cf.pa2.bg-white.shadow-5.bb.b--black-10", [
      m(".fl.w-10.pa2", [
        m(Checkmark, {
          checked: todo.done,
          changeFn: TodosModel.toggle.bind(this, todo.id)
        })
      ]),
      m(".fl.w-90.cf.pa1", [m(TextField, { todo: todo })])
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

var AddTodoInput = {
  handleChange: function(vnode) {
    return function(e) {
      vnode.state.text = e.target.value;
    };
  },
  addTodo: function(vnode) {
    return function(e) {
      e.preventDefault();
      TodosModel.add({ text: vnode.state.text, done: TodosModel.allChecked });
      vnode.state.text = "";
    };
  },
  view: function(vnode) {
    return m("form", { onsubmit: vnode.state.addTodo(vnode) }, [
      m(
        "input[type='text'].clean-input.input-reset.bg-near-white.f3.fw2.lh-copy.db.w-100.pv1",
        {
          placeholder: "What needs to be done?",
          autofocus: true,
          value: vnode.state.text || "",
          oninput: vnode.state.handleChange(vnode)
        }
      )
    ]);
  }
};

var Header = {
  handleCheck: function() {
    if (TodosModel.allChecked) {
      TodosModel.unCheckAll();
    } else {
      TodosModel.checkAll();
    }
    TodosModel.allChecked = !TodosModel.allChecked;
  },
  view: function(vnode) {
    return m(".cf.pa2.bg-near-white.shadow-5.bb.bw1.b--moon-gray", [
      m(".fl.w-10.pa2", [
        m(Checkmark, {
          checked: TodosModel.allChecked,
          changeFn: vnode.state.handleCheck
        })
      ]),
      m(".fl.w-90.cf.pa1", [m(AddTodoInput)])
    ]);
  }
};

var Filter = {
  view: function(vnode) {
    var filter = vnode.attrs.filter;
    var count = vnode.attrs.count;
    var activeClass = classNames({
      "bg-light-green": "/" + filter === m.route.get()
    });
    return m(
      "a[href=/" + filter + "].fl.pa2.mh2.ba.b--black-10.ttc",
      {
        oncreate: m.route.link,
        onupdate: m.route.link,
        class: activeClass
      },
      count + " " + filter
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
    return m(".ph2.pt3.pb2.bg-white.shadow-5.cf", [
      m(Filter, { filter: "all", count: TodosModel.getAllTodos().length }),
      m(Filter, {
        filter: "active",
        count: TodosModel.getActiveTodos().length
      }),
      m(Filter, {
        filter: "completed",
        count: TodosModel.getCompletedTodos().length
      }),
      m(ClearCompleted)
    ]);
  }
};

var ShowChildrenIf = {
  view: function(vnode) {
    return vnode.attrs.show ? vnode.children : [];
  }
};

var App = {
  view: function(vnode) {
    var todos = vnode.attrs.todos;
    return m("div", [
      m(Header),
      m(ShowChildrenIf, { show: !!TodosModel.todos.length }, [
        m(Todos, { todos: todos }),
        m(Footer)
      ])
    ]);
  }
};

m.route(document.getElementById("app"), "/all", {
  "/all": {
    render: function(vnode) {
      var todos = TodosModel.getAllTodos();
      return m(App, { todos: todos });
    }
  },
  "/active": {
    render: function(vnode) {
      var todos = TodosModel.getActiveTodos();
      return m(App, { todos: todos });
    }
  },
  "/completed": {
    render: function(vnode) {
      var todos = TodosModel.getCompletedTodos();
      return m(App, { todos: todos });
    }
  }
});
