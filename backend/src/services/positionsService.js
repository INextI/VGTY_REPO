// services/positionsService.js
const Positions = require('../models/positionsModel');

class PositionsService {
    async create(data) {
        return await Positions.create(data);
    }

    async getAll() {
        return await Positions.findAll();
    }

    async getById(id) {
        return await Positions.findByPk(id);
    }

    async update(id, data) {
        const position = await Positions.findByPk(id);
        if (!position) return null;
        return await position.update(data);
    }

    async delete(id) {
        const position = await Positions.findByPk(id);
        if (!position) return null;
        await position.destroy();
        return true;
    }

    async getByName(name) {
        return await Positions.findOne({ where: { name } });
    }
}

module.exports = new PositionsService();