const BaseRepository = require('./baseRepository');
const TaskComment = require('../../model/commentModel'); // Ensure correct path

class commentRepository extends BaseRepository {
    constructor() {
        super(TaskComment);
    }

}

module.exports =  commentRepository;