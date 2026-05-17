const express = require("express");
const {
  assignTask,
  getMyTasks,
  completeTask,
  getAllTasks,
} = require("../controllers/taskController");
const checkAuth = require("../middleware/check-auth");

const taskRoutes = express.Router();

taskRoutes.use(checkAuth);

taskRoutes.get("/all", getAllTasks);
taskRoutes.post("/assign/:uid", assignTask);
taskRoutes.get("/my-tasks/:uid", getMyTasks);
taskRoutes.patch("/complete/:taskId", completeTask);

module.exports = taskRoutes;
