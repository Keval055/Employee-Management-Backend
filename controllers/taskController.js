const userModel = require("../models/user");

const verifyAdmin = async (userId) => {
  const user = await userModel.findById(userId);
  return !!user?.isSuperUser;
};

const assignTask = async (req, res) => {
  const { title, description } = req.body;
  const uid = req.params.uid;

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Task title and description are required" });
  }

  try {
    const isAdmin = await verifyAdmin(req.userData.userId);
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can assign tasks" });
    }

    const user = await userModel.findByIdAndUpdate(
      uid,
      {
        $push: {
          tasks: {
            title,
            description,
            status: "pending",
            assignedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Could not find the user" });
    }

    return res
      .status(201)
      .json({ message: "Task assigned successfully", tasks: user.tasks });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMyTasks = async (req, res) => {
  const uid = req.params.uid;

  try {
    const isAdmin = await verifyAdmin(req.userData.userId);
    if (req.userData.userId !== uid && !isAdmin) {
      return res.status(403).json({ message: "You can only view your tasks" });
    }

    const user = await userModel.findById(uid).select("tasks name email");
    if (!user) {
      return res.status(404).json({ message: "Could not find the user" });
    }

    return res.status(200).json({ tasks: user.tasks, user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const completeTask = async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const user = await userModel.findOne({ "tasks._id": taskId });
    if (!user) {
      return res.status(404).json({ message: "Could not find the task" });
    }

    if (user._id.toString() !== req.userData.userId) {
      return res
        .status(403)
        .json({ message: "You can only complete your own tasks" });
    }

    const task = user.tasks.id(taskId);
    task.status = "completed";
    task.completedAt = new Date();

    await user.save();

    return res
      .status(200)
      .json({ message: "Task marked as completed", tasks: user.tasks });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req.userData.userId);
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can view all tasks" });
    }

    const users = await userModel
      .find({ "tasks.0": { $exists: true } })
      .select("name email position tasks");

    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  assignTask,
  getMyTasks,
  completeTask,
  getAllTasks,
};
