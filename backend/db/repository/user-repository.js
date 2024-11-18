const BaseRepository = require('./baseRepository');
const User = require('../../model/userLogin'); // Ensure correct path

class UserLoginRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async getUserByEmail(email) {
        try {
            return await this.model.findOne({ where: { email } });
        } catch (error) {
            throw error;
        }
    }

    async getUserByGoogleId(id) {
        try {
            return await this.model.findOne({ where: { id } });
        } catch (error) {
            throw error;
        }
    }

    async insertUser(data, token) {
        try {
          const { picture, ...userData } = data;

          if (picture) {
              userData.logo = picture;
          }
            return await this.create(userData);
        } catch (error) {
            throw error;
        }
    }

}

module.exports =  UserLoginRepository;