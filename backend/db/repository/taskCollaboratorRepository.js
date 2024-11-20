const BaseRepository = require('./baseRepository');
const collaborator = require('../../model/taskCollaboratorModel'); // Ensure correct path

class collaboratorRepository extends BaseRepository {
    constructor() {
        super(collaborator);
    }

}

module.exports =  collaboratorRepository;