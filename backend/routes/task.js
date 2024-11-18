/* eslint no-undef: "off" */
const express = require("express");
const { sequelize } = require("../model/baseModel");
const { transporter } = require("../db/db");
const taskRepository = require("../db/repository/taskRepository");
const projectRepository = require("../db/repository/projectRepository");
const userRepository = require("../db/repository/user-repository");
const collaboratorRepository = require("../db/repository/taskCollaboratorRepository");
const attachmentRepository = require("../db/repository/taskAttachment");
const {upload} = require("../db/db");
class TaskController {
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
    this.router.post("/task/create", upload.array("myImage"),this.store.bind(this));
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

  async dashboard(req, res) {
    try {
      const userId = req.user.user_id; // Assuming user info is available from session or JWT token
  
      // Get all the tasks where the user is a collaborator
      const collaborators = await this.collaboratorRepository.findAll({
        where: { collaborator_id: userId }
      });
   
      // Extract distinct task IDs from the collaborators
      const taskIds = [...new Set(collaborators.map(collaborator => collaborator.task_id))];
      console.log(taskIds);
      // Now, find the tasks based on those task IDs
      const tasks = await this.taskRepository.getAllTasksAssociatedToUsers(taskIds);
   
      // Return the tasks with their attachments
      res.status(200).json({ tasks: tasks });
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

  // Function to send task notification emails
  async sendTaskNotification(emails, role, task) {
    if (emails.length === 0) return;

    const mailOptions = {
      from: "maxrai788@gmail.com", // Sender address
      to: emails.join(","), // Join multiple emails if there are more than one
      subject: `You have been assigned as a ${role} to the task: ${task.title}`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 12px; box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <div style="background-color: #f3f4f7; color: white; padding: 20px; text-align: center;">
            <h2 style="font-size: 24px; margin: 0;">New Task Assigned: ${
              task.title
            }</h2>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hello,</p>
            <p style="font-size: 16px; color: #333; line-height: 1.5;">You have been assigned a new task <strong>${
              task.title
            }</strong> in the project management system. Here are the details:</p>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 20px;">
              <h3 style="font-size: 18px; color: #4c6ef5; margin-bottom: 15px;">Task Details</h3>
              <p style="font-size: 15px; color: #555; margin: 5px 0;"><strong>Description:</strong> ${
                task.description || "No description available."
              }</p>
              <p style="font-size: 15px; color: #555; margin: 5px 0;"><strong>Deadline:</strong> ${
                task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "No deadline set."
              }</p>
            </div>

            <p style="font-size: 16px; color: #333; margin-top: 20px;">Please log into the project management system to review and update the task as needed.</p>

            <div style="margin-top: 30px; text-align: center; padding: 15px;">
              <p style="font-size: 14px; color: #888;">Best Regards,</p>
              <p style="font-size: 14px; color: #888;">Your Project Management Team</p>
            </div>
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
