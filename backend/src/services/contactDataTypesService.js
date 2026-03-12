// services/contactDataTypesService.js
const ContactDataTypes = require('../models/contactDataTypesModel');

class ContactDataTypesService {
    async create(data) {
        return await ContactDataTypes.create(data);
    }

    async getAll() {
        return await ContactDataTypes.findAll();
    }

    async getById(id) {
        return await ContactDataTypes.findByPk(id);
    }

    async update(id, data) {
        const type = await ContactDataTypes.findByPk(id);
        if (!type) return null;
        return await type.update(data);
    }

    async delete(id) {
        const type = await ContactDataTypes.findByPk(id);
        if (!type) return null;
        await type.destroy();
        return true;
    }

    async getByName(name) {
        return await ContactDataTypes.findOne({ where: { name } });
    }
}

module.exports = new ContactDataTypesService();