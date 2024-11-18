const BaseRepository = require('./baseRepository');
const UserLogin = require('../../model/UserLoginModel'); // Ensure correct path

class User_LoginRepository extends BaseRepository {
    constructor() {
        super(UserLogin);
    }

}

module.exports =  User_LoginRepository;