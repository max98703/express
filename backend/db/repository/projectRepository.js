const BaseRepository = require('./baseRepository');
const projects = require('../../model/projectModel'); // Ensure correct path

class projectRepository extends BaseRepository {
    constructor() {
        super(projects);
    }

}

module.exports =  projectRepository;