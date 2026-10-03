import { Router } from "express";
import { addTodo, deleteTodo, listTodos, updateTodo } from "../controllers/todo.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/").get(listTodos).post(addTodo);
router.route("/:todoId").patch(updateTodo).delete(deleteTodo);

export default router;