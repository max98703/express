/* eslint no-undef: "off" */
const express = require("express");
const { sequelize } = require("../model/baseModel");
const { transporter } = require("../db/db");
const taskRepository = require("../db/repository/taskRepository");
const projectRepository = require("../db/repository/projectRepository");
const userRepository = require("../db/repository/user-repository");
const collaboratorRepository = require("../db/repository/taskCollaboratorRepository");
const attachmentRepository = require("../db/repository/taskAttachment");
const taskLogRepository = require("../db/repository/taskLogRepository");
const { publishLoginSuccessNotification } = require("../services/service");
const { upload } = require("../db/db");

class TaskController {
  constructor() {
    this.taskRepository = new taskRepository();
    this.projectRepository = new projectRepository();
    this.userRepository = new userRepository();
    this.collaboratorRepository = new collaboratorRepository();
    this.attachmentRepository = new attachmentRepository();
    this.taskLogRepository = new taskLogRepository();
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/task/create",
      upload.array("myImage"),
      this.store.bind(this)
    );
    this.router.post("/task/update/:id", this.update.bind(this));
    this.router.get("/task/edit/:id", this.edit.bind(this));
    this.router.get("/tasks", this.tasks.bind(this));
    this.router.get("/user/task/dashboard", this.dashboard.bind(this));
  }

  async tasks(req, res) {
    try {
      const [tasks, projects, users] = await Promise.all([
        this.taskRepository.getAllTasksWithProjects(),
        this.projectRepository.findAll(),
        this.userRepository.findAll(),
      ]);
      res.status(200).json({ tasks, projects, users });
    } catch (error) {
      console.error("Error retrieving task:", error);
      res.status(500).json({ message: "Failed to retrieve task" });
    }
  }
  
  async edit(req, res) {
    const { id } = req.params;
    try {
      const [tasks, taskLogs] = await Promise.all([
        this.taskRepository.getAllTasksAssociatedToUsers(id),
        this.taskLogRepository.findAll({ where: { taskId: id } })
      ]);
  
      res.status(200).json({ tasks, taskLogs });
    } catch (error) {
      console.error("Error retrieving task:", error);
      res.status(500).json({ message: "Failed to retrieve task" });
    }
  }
  

  async dashboard(req, res) {
    const { assignee, reviewers, project } = req.query; // Access query params
  
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
  
      // Now, find the tasks based on those task IDs
      let tasks = await this.taskRepository.getAllTasksAssociatedToUsers(taskIds);
  
      // Handle project filtering
      if (project) {
        // Log project value for debugging
        console.log("Filtering by project ID:", project);
  
        // Convert project to a number (assuming project_id in the task is numeric)
        const projectId = Number(project);
  
        // Check if the conversion was successful (i.e., it's a valid number)
        if (!isNaN(projectId)) {
          tasks = tasks.filter(task => task.project_id === projectId);
        } else {
          console.error("Invalid project ID:", project);
        }
      }
  
      
      // Handle assignee filtering (flag is true for assignee)
      if (assignee) {
        const assigneeArray = JSON.parse(assignee).map(id => Number(id));

        if (Array.isArray(assigneeArray)) {
          tasks = tasks.filter(task =>
            task.collaborators
              .filter(collaborator => collaborator.flag === true)  // Filter first by flag (assignee)
              .some(collaborator => assigneeArray.includes(collaborator.collaborator_id))  // Then check if collaborator_id is in the assignee array
          );
        }
      }

      // Handle reviewers filtering (flag is false for reviewer)
      if (reviewers) {
        const reviewersArray = JSON.parse(reviewers).map(id => Number(id));

        if (Array.isArray(reviewersArray)) {
          tasks = tasks.filter(task =>
            task.collaborators
              .filter(collaborator => collaborator.flag === false)  // Filter first by flag (reviewer)
              .some(collaborator => reviewersArray.includes(collaborator.collaborator_id))  // Then check if collaborator_id is in the reviewers array
          );
        }
    }
      // Fetch users and projects to return in response
      const users = await this.userRepository.findAll();
      const projects = await this.projectRepository.findAll();
  
      // Return the tasks with their attachments
      res.status(200).json({ tasks: tasks, users: users, projects: projects });
  
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  }
  
  async store(req, res) {
    const { title, description, deadline, projectId, priority } = req.body;
    const t = await sequelize.transaction();

    try {
      const created_by = req.user?.user_id;
      const assignees = JSON.parse(req.body.assignees || "[]");
      const reviewers = JSON.parse(req.body.reviewers || "[]");

      // Create task
      const task = await this.taskRepository.create(
        {
          title,
          description,
          deadline,
          project_id: projectId,
          status: "0",
          priority,
          created_by,
        },
        { transaction: t }
      );

      // Create collaborators (assignees and reviewers)
      const collaborators = [
        ...assignees.map((assignee) => ({
          task_id: task.id,
          collaborator_id: assignee,
          flag: 0,
          created_by,
        })),
        ...reviewers.map((reviewer) => ({
          task_id: task.id,
          collaborator_id: reviewer,
          flag: 1,
          created_by,
        })),
      ];
      await this.collaboratorRepository.bulkCreate(collaborators, {
        transaction: t,
      });

      // Create attachments only if files are present
      if (req.files?.length) {
        const attachments = req.files.map((file) => ({
          task_id: task.id,
          name: file.filename,
          flag: "0",
          created_by,
        }));
        await this.attachmentRepository.bulkCreate(attachments, {
          transaction: t,
        });
      }

      // Commit transaction
      await t.commit();

      // Send emails asynchronously
      const assigneeEmails = await this.getEmails(assignees);
      const reviewerEmails = await this.getEmails(reviewers);

      const collaboratorIds = [
        ...new Set(
          collaborators.map((collaborator) => collaborator.collaborator_id)
        ),
      ];

      await publishLoginSuccessNotification(collaboratorIds);
      Promise.all([
        this.sendTaskNotification(assigneeEmails, "Assignee", task),
        this.sendTaskNotification(reviewerEmails, "Reviewer", task),
      ]).catch((error) => console.error("Error sending emails:", error));

      // Respond with success
      res.status(200).json({ message: "Task created successfully" });
    } catch (error) {
      await t.rollback();
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const { deadline, priority } = req.body;
    const t = await sequelize.transaction();

    try {
      const updated_by = req.user?.user_id;
      const assignees = Array.isArray(req.body.assignees) ? req.body.assignees : JSON.parse(req.body.assignees || "[]");
      const reviewers = Array.isArray(req.body.reviewers) ? req.body.reviewers : JSON.parse(req.body.reviewers || "[]");
      // Retrieve existing task by taskId
      const task = await this.taskRepository.findById(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Update task details
      const updatedTask = await this.taskRepository.update(
        id,
        {
          deadline,
          priority,
          updated_by:req.user.user_id,
        },
        { transaction: t }
      );

      // Step 1: Get current collaborators
      const currentCollaborators =
        await this.collaboratorRepository.findByTaskId(id, { transaction: t });

      // Step 2: Separate the assignees and reviewers from current collaborator
      const currentAssignees = currentCollaborators.filter(
        (collaborator) => collaborator.flag == "0"
      ); // flag 0 is assignee
      const currentReviewers = currentCollaborators.filter(
        (collaborator) => collaborator.flag == "1"
      ); // flag 1 is reviewer
      
      // // Step 3: Remove those who are no longer assignees or reviewers
      const toRemoveAssignees = currentAssignees.filter(
        (collaborator) => !assignees.includes(collaborator.collaborator_id)
      );
      const toRemoveReviewers = currentReviewers.filter(
        (collaborator) => !reviewers.includes(collaborator.collaborator_id)
      );

      // // Delete the removed collaborators
      const collaboratorsToDelete = [
        ...toRemoveAssignees.map((collaborator) => collaborator.collaborator_id),
        ...toRemoveReviewers.map((collaborator) => collaborator.collaborator_id),
      ];

      if (collaboratorsToDelete.length > 0) {
        await this.collaboratorRepository.deleteByIds(
          collaboratorsToDelete,
          id,
          { transaction: t }
        );
      }

      // // Step 4: Add new assignees and reviewers
      const newCollaborators = [
        ...assignees
          .filter(
            (assignee) =>
              !currentAssignees.some(
                (collaborator) => collaborator.collaborator_id === assignee
              )
          )
          .map((assignee) => ({
            task_id: id,
            collaborator_id: assignee,
            flag: 0, // Assignee flag
            created_by: updated_by,
          })),
        ...reviewers
          .filter(
            (reviewer) =>
              !currentReviewers.some(
                (collaborator) => collaborator.collaborator_id === reviewer
              )
          )
          .map((reviewer) => ({
            task_id: id,
            collaborator_id: reviewer,
            flag: 1, // Reviewer fla
            created_by: updated_by,
          })),
      ];

      // // Bulk create new collaborators
      let createdCollaborators = [];
      if (newCollaborators.length > 0) {
          createdCollaborators = await this.collaboratorRepository.bulkCreate(newCollaborators, {
          transaction: t,
        });
      }

   

      const collaboratorIds = [
        ...new Set(
          newCollaborators.map((collaborator) => String(collaborator.collaborator_id))
        ),
      ];
      if (collaboratorIds.length > 0) {
      
        await publishLoginSuccessNotification(collaboratorIds);
      }

      const newAssignees = newCollaborators.filter(
        (collaborator) => collaborator.flag === 0
      );
      const newReviewers = newCollaborators.filter(
        (collaborator) => collaborator.flag === 1
      );
      const assigneeEmails = await this.getEmails(
        newAssignees.map((c) => c.collaborator_id)
      );
      const reviewerEmails = await this.getEmails(
        newReviewers.map((c) => c.collaborator_id)
      );

      const notificationPromises = [];

      // Add notifications for assignees if there are any emails
      if (assigneeEmails.length > 0) {
        notificationPromises.push(
          this.sendTaskNotification(assigneeEmails, "Assignee", updatedTask)
        );
      }

      // Add notifications for reviewers if there are any emails
      if (reviewerEmails.length > 0) {
        notificationPromises.push(
          this.sendTaskNotification(reviewerEmails, "Reviewer", updatedTask)
        );
      }

      // Execute only if there are notification promises
      if (notificationPromises.length > 0) {
        Promise.all(notificationPromises).catch((error) =>
          console.error("Error sending emails:", error)
        );
      }

      await t.commit();
      // // Respond with success
      res
        .status(200)
        .json({ message: "Task updated successfully", task: updatedTask,newCollaborators:  createdCollaborators });
    } catch (error) {
      await t.rollback();
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  }

  // Function to send task notification emails
  async sendTaskNotification(emails, role, task) {
    if (emails.length === 0) return;

    const mailOptions = {
      from: "maxrai788@gmail.com",
      to: emails.join(","),
      subject: `You have been assigned as a ${role} to the task: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px; color: #1f2937;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="background-color: #2563eb; color: #ffffff; padding: 24px; text-align: center; border-bottom: 4px solid #1e40af;">
              <h2 style="font-size: 24px; font-weight: bold; margin: 0;">Task Assigned: ${task.title}</h2>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 16px; margin-bottom: 16px;">Hi,</p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                You have been assigned as a <strong>${role}</strong> for the task <strong>${task.title}</strong>. Below are the details:
              </p>
              <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 12px;">Task Details</h3>
                <p style="margin: 4px 0; font-size: 15px;"><strong>Description:</strong> ${
                  task.description || "No description provided."
                }</p>
                <p style="margin: 4px 0; font-size: 15px;"><strong>Deadline:</strong> ${
                  task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : "No deadline set."
                }</p>
              </div>
              <p style="font-size: 16px; margin-bottom: 20px;">
                Please log into the project management system to review and update the task as needed.
              </p>
              <a href="https://yourprojectmanagement.com" style="
                  display: inline-block; 
                  background-color: #2563eb; 
                  color: #ffffff; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  font-size: 16px; 
                  font-weight: bold;
                  text-align: center;
                  margin-top: 20px;
                ">
                Go to Dashboard
              </a>
            </div>
            <div style="padding: 16px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280; margin: 0;">Best Regards,</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">Your Project Management Team</p>
            </div>
          </div>
        </div>
      `,
    };
    

    // Send the email
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${role}s: ${emails}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  // Function to fetch email addresses of users by their IDs (You may need to implement this based on your database setup)
  async getEmails(userIds) {
    // Example: assuming `User` is your model for users
    const users = await this.userRepository.findAll({
      where: {
        id: userIds,
      },
      attributes: ["email"],
    });
    return users.map((user) => user.email);
  }
}

module.exports = new TaskController().router;
