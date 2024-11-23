const BaseRepository = require('./baseRepository');
const tasks = require('../../model/taskModel'); // Ensure correct path
const Project = require('../../model/projectModel')
const TaskCollaborator = require('../../model/taskCollaboratorModel');
const TaskAttachment = require('../../model/attachmentModel');
const User = require("../../model/userLogin");

const { format, isToday, isTomorrow ,isPast,differenceInDays } = require('date-fns');

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
                    as: "creator",  // Use "creator" alias
                },
                {
                    model: TaskCollaborator,
                    as: "collaborators",  // Use "collaborators" alias
                    include: [
                        {
                            model: User,
                            as: "user",  // Include user details for each collaborator
                            attributes: ['id', 'name', 'email','logo'],  // Adjust as needed
                        }
                    ]
                },
            ],
            order: [['id', 'DESC']]  // Order by task `id` in descending order
        }).then(tasks => {
            return tasks.map(task => {
                // Format deadline if it exists
                if (task.deadline) {
                    const deadlineDate = new Date(task.deadline);
                    let formattedDeadline;
    
                    if (isToday(deadlineDate)) {
                        formattedDeadline = `Today at ${format(deadlineDate, 'hh:mm a')}`;
                    } else if (isTomorrow(deadlineDate)) {
                        formattedDeadline = `Tomorrow at ${format(deadlineDate, 'hh:mm a')}`;
                    } 
                    else if (isPast(deadlineDate)) {
                        const daysPast = differenceInDays(new Date(), deadlineDate);
                        formattedDeadline = `Past Due (${daysPast} day${daysPast > 1 ? 's' : ''} ago, was due at ${format(deadlineDate, 'hh:mm a')})`;
                    }else {
                        formattedDeadline = format(deadlineDate, 'dd-MM-yyyy at hh:mm a');
                    }
    
                    task.dataValues.formattedDeadline = formattedDeadline;
                }
    
                return task;
            });
        });
    }
    
    
    async getAllTasksAssociatedToUsers(taskId){
        return await this.findAll({
            where: {
                id: taskId,
                status: [0,1,2,3,4],  // Filter tasks by status
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