/* eslint no-undef: "off" */
const express = require("express");
const taskRepository = require("../db/repository/taskRepository");
const commentRepository = require("../db/repository/taskCommentRepository");

class CommentController {
  constructor() {
    this.taskRepository = new taskRepository();
    this.commentRepository = new commentRepository();
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/comment", this.create.bind(this)); 
  }

  async create(req, res) {
    const { task_id, comment, status } = req.body;
    
    try {
      // Case 1: If `status` is provided but no comment, only update the task's status
      if (status && !comment) {
        // Check if the task exists
        const taskExists = await this.taskRepository.findById(task_id);
        if (!taskExists) {
          return res.status(404).json({ message: "Task not found" });
        }
  
        // Update task status
        await this.taskRepository.update(task_id, { status });
        return res.status(200).json({ message: "Task status updated successfully" });
      }
  
      // Case 2: If `comment` is provided, authenticate and create the comment
      if (!comment) {
        return res.status(400).json({ message: "Task ID and comment are required" });
      }
  
      // Check if the task exists
      const taskExists = await this.taskRepository.findById(task_id);
      if (!taskExists) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Ensure the user is authenticated (assuming `req.user` holds authenticated user info)
      if (!req.user || !req.user.user_id) {
        return res.status(403).json({ message: "Authentication is required to add a comment" });
      }
  
      // Create new comment
      const newComment = await this.commentRepository.create({
        task_id,
        comment,
        created_by: req.user.user_id,
      });
  
      // Optionally update the task's status if both `status` and `comment` are provided
      if (status) {
        await this.taskRepository.update(task_id, { status });
      }
  
      return res.status(201).json({ message: "Comment created successfully", newComment });
    } catch (error) {
      console.error("Error creating comment or updating status:", error);
      return res.status(500).json({ message: "Failed to create comment or update task status" });
    }
  }
  
  
  
}

module.exports = new CommentController().router;
