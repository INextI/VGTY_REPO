// services/documentTypeService.js
const DocumentType = require('../models/documentTypes');

class DocumentTypeService {
    async create(data) {
        return await DocumentType.create(data);
    }

    async getAll() {
        return await DocumentType.findAll();
    }

    async getById(id) {
        return await DocumentType.findByPk(id);
    }

    async update(id, data) {
        const type = await DocumentType.findByPk(id);
        if (!type) return null;
        return await type.update(data);
    }

    async delete(id) {
        const type = await DocumentType.findByPk(id);
        if (!type) return null;
        await type.destroy();
        return true;
    }

    async getByName(name) {
        return await DocumentType.findOne({ where: { name } });
    }
}

module.exports = new DocumentTypeService();