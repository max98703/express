const BaseRepository = require('./baseRepository');
const TaskAttachment = require('../../model/attachmentModel'); // Ensure correct path

class attachmentRepository extends BaseRepository {
    constructor() {
        super(TaskAttachment);
    }

}

module.exports =  attachmentRepository;