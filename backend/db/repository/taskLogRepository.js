const { Op } = require('sequelize');
const dayjs = require('dayjs'); // Use dayjs for date manipulation
const BaseRepository = require('./baseRepository');
const User = require("../../model/userLogin");
const Task = require("../../model/taskModel");
const taskLog = require("../../model/taskLogModel");

class TaskLogRepository extends BaseRepository {
    constructor() {
        super(taskLog);
    }

    async getAllTaskLogs(taskId) {
        // Get today's date at 00:00:00 and the end of the day at 23:59:59
        const startOfDay = dayjs().startOf('day'); // Today's date at 00:00:00
        const endOfDay = dayjs().endOf('day'); // Today's date at 23:59:59

        const logs = await this.findAll({
            where: {
                taskId: taskId,
                created_at: {
                    [Op.gte]: startOfDay.toDate(), // Start of the day
                    [Op.lte]: endOfDay.toDate(),   // End of the day (up to 23:59:59)
                },
            },
            include: [
                {
                    model: User,
                    as: "creator", // Use the "creator" alias
                    attributes: ['name'], // Only include the 'name' attribute of the creator
                },
                {
                    model: Task,
                    as: "task", // Use the "task" alias
                    attributes: ['title'], // Only include the 'title' attribute of the task
                },
            ],
            order: [['id', 'DESC']], // Order by project `id` in descending order
            limit: 250,
        });

        // Format the response to include task name and creator name
        return logs.map((log) => ({
            ...log.dataValues,
            creator: log.creator ? log.creator.name : null, // Flatten the creator to just name
            task: log.task ? log.task.title : null, // Flatten the task to just name
        }));
    }
}

module.exports = TaskLogRepository;
