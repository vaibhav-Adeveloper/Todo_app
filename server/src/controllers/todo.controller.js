import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Todo } from "../models/todo.model.js";
import { isDemoMode } from "../utils/demoMode.js";
import {
  createDemoTodo,
  deleteDemoTodo,
  listDemoTodos,
  updateDemoTodo,
} from "../utils/demoStore.js";

const listTodos = asyncHandler(async (req, res) => {
  if (isDemoMode) {
    return res
      .status(200)
      .json(new ApiResponse(200, { todos: listDemoTodos() }, "Todos fetched successfully"));
  }

  const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, { todos }, "Todos fetched successfully"));
});

const addTodo = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, dueTime } = req.body;
  if (!title?.trim() || !description?.trim() || !dueDate || !dueTime) {
    throw new ApiError(400, "Title, description, due date and due time are required");
  }
  if (
    (priority && !["low", "medium", "high"].includes(priority)) ||
    Number.isNaN(new Date(dueDate).getTime()) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(dueTime)
  ) {
    throw new ApiError(400, "Priority, due date or due time is invalid");
  }

  if (isDemoMode) {
    const todo = createDemoTodo({ title, description, priority, dueDate, dueTime });
    return res
      .status(201)
      .json(new ApiResponse(201, { todo }, "Todo created successfully"));
  }

  const todo = await Todo.create({
    title: title.trim(),
    description: description.trim(),
    priority,
    dueDate,
    dueTime,
    user: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { todo }, "Todo created successfully"));
});

const updateTodo = asyncHandler(async (req, res) => {
  const { todoId } = req.params;
  if (isDemoMode) {
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([field]) =>
        ["title", "description", "status", "priority", "dueDate", "dueTime"].includes(field),
      ),
    );
    if (typeof updates.title === "string") updates.title = updates.title.trim();
    if (typeof updates.description === "string") updates.description = updates.description.trim();
    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "At least one valid todo field is required");
    }
    if (
      (updates.title !== undefined && !updates.title) ||
      (updates.description !== undefined && !updates.description) ||
      (updates.status !== undefined &&
        !["pending", "in-progress", "completed"].includes(updates.status)) ||
      (updates.priority !== undefined &&
        !["low", "medium", "high"].includes(updates.priority)) ||
      (updates.dueDate !== undefined && Number.isNaN(new Date(updates.dueDate).getTime())) ||
      (updates.dueTime !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(updates.dueTime))
    ) {
      throw new ApiError(400, "One or more todo fields are invalid");
    }
    const todo = updateDemoTodo(todoId, updates);
    if (!todo) throw new ApiError(404, "Todo not found");
    return res
      .status(200)
      .json(new ApiResponse(200, { todo }, "Todo updated successfully"));
  }

  if (!mongoose.isValidObjectId(todoId)) {
    throw new ApiError(400, "Invalid todo ID");
  }

  const allowedFields = ["title", "description", "status", "priority", "dueDate", "dueTime"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([field]) => allowedFields.includes(field)),
  );
  if (typeof updates.title === "string") updates.title = updates.title.trim();
  if (typeof updates.description === "string") updates.description = updates.description.trim();
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "At least one valid todo field is required");
  }

  const todo = await Todo.findOneAndUpdate(
    { _id: todoId, user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!todo) {
    throw new ApiError(404, "Todo not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { todo }, "Todo updated successfully"));
});

const deleteTodo = asyncHandler(async (req, res) => {
  const { todoId } = req.params;
  if (isDemoMode) {
    const todo = deleteDemoTodo(todoId);
    if (!todo) throw new ApiError(404, "Todo not found");
    return res
      .status(200)
      .json(new ApiResponse(200, { todo }, "Todo deleted successfully"));
  }

  if (!mongoose.isValidObjectId(todoId)) {
    throw new ApiError(400, "Invalid todo ID");
  }

  const todo = await Todo.findOneAndDelete({ _id: todoId, user: req.user._id });
  if (!todo) {
    throw new ApiError(404, "Todo not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { todo }, "Todo deleted successfully"));
});

export { listTodos, addTodo, updateTodo, deleteTodo };
