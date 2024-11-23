/* eslint no-undef: "off" */
const express = require("express");
const taskLogRepository = require("../db/repository/taskLogRepository");
const collaboratorRepository = require("../db/repository/taskCollaboratorRepository");
class TaskLogController {
  constructor() {
    this.taskLogRepository = new taskLogRepository();
    this.collaboratorRepository = new collaboratorRepository();
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/activity", this.index.bind(this));
  }

  async index(req, res) {
    try {
    const userId = req.user.user_id; // Assuming user info is available from session or JWT token

    // Get all the tasks where the user is a collaborator
    const collaborators = await this.collaboratorRepository.findAll({
      where: { collaborator_id: userId },
    });

    // Extract distinct task IDs from the collaborators
    const taskIds = [
      ...new Set(collaborators.map((collaborator) => collaborator.task_id)),
    ];
      const [ logs] = await Promise.all([
        this.taskLogRepository.getAllTaskLogs(taskIds)
      ]);
    
      res.status(200).json({ logs});
    } catch (error) {
      console.error("Error retrieving task:", error);
      res.status(500).json({ message: "Failed to retrieve task" });
    }
  }

 
}

module.exports = new TaskLogController().router;
