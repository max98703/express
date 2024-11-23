const BaseRepository = require('./baseRepository');
const projects = require('../../model/projectModel'); // Ensure correct path
const User = require("../../model/userLogin");

class projectRepository extends BaseRepository {
    constructor() {
        super(projects);
    }

    async getAllProjects() {
        const projectsData = await this.findAll({
            include: [
                {
                    model: User,
                    as: "creator",  // Use the "creator" alias
                    attributes: ['name']  // Only include the 'name' attribute of the creator
                }
            ],
            order: [['id', 'DESC']]  // Order by project `id` in descending order
        });

        // Optionally, format the response to only include the necessary project details
        return projectsData.map(project => {
            return {
                ...project.dataValues,
                creator: project.creator ? project.creator.name : null // Flatten the creator to just name
            };
        });
    }
}

module.exports = projectRepository;
