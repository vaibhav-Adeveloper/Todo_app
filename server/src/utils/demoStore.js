import { randomBytes } from "node:crypto";

const demoUser = Object.freeze({
  _id: "000000000000000000000001",
  username: "demo",
  email: "demo@todo.local",
  profileImage: "",
});

const demoTodos = [
  {
    _id: "000000000000000000000101",
    title: "Welcome to your demo account",
    description: "Add, edit, complete, or delete tasks. Changes stay in memory while the server is running.",
    status: "pending",
    priority: "high",
    dueDate: new Date(Date.now() + 86_400_000).toISOString(),
    dueTime: "17:00",
    user: demoUser._id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "000000000000000000000102",
    title: "Try completing a task",
    description: "Use the status menu to mark this task complete.",
    status: "in-progress",
    priority: "medium",
    dueDate: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    dueTime: "12:00",
    user: demoUser._id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const getDemoUser = () => ({ ...demoUser });

const listDemoTodos = () =>
  demoTodos
    .filter((todo) => todo.user === demoUser._id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((todo) => ({ ...todo }));

const createDemoTodo = (values) => {
  const now = new Date().toISOString();
  const todo = {
    _id: randomBytes(12).toString("hex"),
    title: values.title.trim(),
    description: values.description.trim(),
    status: "pending",
    priority: values.priority || "medium",
    dueDate: new Date(values.dueDate).toISOString(),
    dueTime: values.dueTime,
    user: demoUser._id,
    createdAt: now,
    updatedAt: now,
  };
  demoTodos.push(todo);
  return { ...todo };
};

const updateDemoTodo = (todoId, updates) => {
  const todo = demoTodos.find(
    (item) => item._id === todoId && item.user === demoUser._id,
  );
  if (!todo) return null;

  Object.assign(todo, updates, {
    updatedAt: new Date().toISOString(),
  });
  if (updates.dueDate) {
    todo.dueDate = new Date(updates.dueDate).toISOString();
  }
  return { ...todo };
};

const deleteDemoTodo = (todoId) => {
  const index = demoTodos.findIndex(
    (item) => item._id === todoId && item.user === demoUser._id,
  );
  if (index === -1) return null;
  return demoTodos.splice(index, 1)[0];
};

export {
  createDemoTodo,
  deleteDemoTodo,
  getDemoUser,
  listDemoTodos,
  updateDemoTodo,
};
