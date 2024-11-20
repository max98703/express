const BaseRepository = require('./baseRepository');
const tasks = require('../../model/taskModel'); // Ensure correct path
const Project = require('../../model/projectModel')
const TaskCollaborator = require('../../model/taskCollaboratorModel');
const TaskAttachment = require('../../model/attachmentModel');
const User = require("../../model/userLogin");
class taskRepository extends BaseRepository {
    constructor() {
        super(tasks);
    }
    
    async getAllTasksWithProjects() {
        return await this.findAll({
            include: [
                {
                    model: Project,
                    as: "project",  // Use "project" alias
                },
                {
                    model: User,
                    as: "creator",  // Use "project" alias
                },
                {
                    model: TaskCollaborator,
                    as: "collaborators",  // Use "collaborators" alias
                    include: [
                        {
                            model: User,
                            as: "user",  // Include user details for each collaborator
                            attributes: ['id', 'name', 'email'],  // Adjust as needed
                        }
                    ]
                },
            ],
            order: [['id', 'DESC']]  // Order by task `id` in descending order
        });
    }
    
    async getAllTasksAssociatedToUsers(taskId){
        return await this.findAll({
            where: {
                id: taskId,
                status: [0,1,2,3]  // Filter tasks by status
            },
            include: [
                {
                    model: Project,
                    as: "project",  // Use "project" alias
                },
                {
                    model: TaskCollaborator,
                    as: "collaborators",  // Use "collaborators" alias
                    include: [
                        {
                            model: User,
                            as: "user",  // Include user details for each collaborator
                            attributes: ['id', 'name', 'email'],  // Adjust as needed
                        }
                    ]
                },
                {
                    model: TaskAttachment,
                    as: "attachments", 
                },
            ],
            order: [['id', 'DESC']]  // Order by task `id` in descending order
        });
    }
    
    
}

module.exports =  taskRepository;