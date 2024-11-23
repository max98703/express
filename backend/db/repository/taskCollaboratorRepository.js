const BaseRepository = require('./baseRepository');
const collaborator = require('../../model/taskCollaboratorModel'); // Ensure correct path

class collaboratorRepository extends BaseRepository {
    constructor() {
        super(collaborator);
    }

    async findByTaskId(taskId, options = {}) {
        try {
          // Assuming TaskCollaborator is your model for collaborators
          return await this.model.findAll({
            where: { task_id: taskId },
            ...options, // Allow for additional options like transaction
          });
        } catch (error) {
          throw new Error("Error fetching collaborators by task ID: " + error.message);
        }                                    




      }

      async deleteByIds(ids, taskId, options = {}) {
        try {
          // Ensure 'ids' is an array
          if (!Array.isArray(ids)) {
            throw new Error("The 'ids' parameter must be an array.");
          }
      
          // Check if ids are empty
          if (ids.length === 0) {
            throw new Error("The 'ids' array cannot be empty.");
          }
      
          // Delete all collaborators with the given ids and taskId
          const result = await this.model.destroy({
            where: {
              task_id: taskId, // Ensure task_id matches the taskId passed in
              collaborator_id: ids,         // Ensure ids match the ones passed in the array
            },
            ...options, // Additional options like transaction can be passed
          });
      
          // Return the result (number of deleted records)
          return result;
        } catch (error) {
          console.error("Error deleting collaborators:", error);
          throw new Error("Error deleting collaborators: " + error.message);
        }
      }
      

}

module.exports =  collaboratorRepository;