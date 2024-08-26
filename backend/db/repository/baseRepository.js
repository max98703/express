class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    
    async getModel() {
        return this.model;  
    }

    async create(data) {
        try {
            return await (await this.getModel()).create(data);
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            return await (await this.getModel()).findByPk(id);
        } catch (error) {
            throw error;
        }
    }

    async findAll(options = {}) {
        try {
            return await (await this.getModel()).findAll(options);
        } catch (error) {
            throw error;
        }
    }

    async update(id, data) {
        try {
            const model = await this.getModel(); 
            const rowsUpdated = await model.update(data, { where: { id } });
            if (!rowsUpdated) {
                throw new Error('No rows updated');
            }
            return await this.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const model = await this.getModel(); // Get the model instance
            const rowsDeleted = await model.destroy({ where: { id } });
            if (!rowsDeleted ) {
                throw new Error('No rows deleted');
            }
            return rowsDeleted;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = BaseRepository;