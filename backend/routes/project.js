/* eslint no-undef: "off" */
const express = require("express");
const taskRepository = require("../db/repository/taskRepository");
const projectRepository = require("../db/repository/projectRepository");
const userRepository = require("../db/repository/user-repository");
const collaboratorRepository = require("../db/repository/taskCollaboratorRepository");
const attachmentRepository = require("../db/repository/taskAttachment");

class ProjectController {
  constructor() {
    this.taskRepository = new taskRepository();
    this.projectRepository = new projectRepository();
    this.userRepository = new userRepository();
    this.collaboratorRepository = new collaboratorRepository();
    this.attachmentRepository = new attachmentRepository();
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/project/:id", this.update.bind(this));
    this.router.get("/projects", this.index.bind(this));
    this.router.post("/project", this.create.bind(this)); 
  }

  async index(req, res) {
    try {
      const [projects] = await Promise.all([
        this.projectRepository.getAllProjects(),
      ]);

      res.status(200).json({ projects });
    } catch (error) {
      console.error("Error retrieving projects:", error);
      res.status(500).json({ message: "Failed to retrieve projects" });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const { name, description} = req.body;

    try {
      // Validate project existence
      const project = await this.projectRepository.findById(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Update project fields
      const updatedProject = await this.projectRepository.update(id, {
        name,
        description,
        createdBy:req.user.user_id,
      });

      res.status(200).json({ message: "Project updated successfully", updatedProject });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  }

  async create(req, res) {
    const { name, description } = req.body;

    try {
      // Validate required fields
      if (!name || !description ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Create new project
      const newProject = await this.projectRepository.create({
        name,
        description,
        createdBy:req.user.user_id,
      });

      res.status(201).json({ message: "Project created successfully", newProject });
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  }
}

module.exports = new ProjectController().router;
