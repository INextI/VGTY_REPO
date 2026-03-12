// services/documentAttachmentService.js
const DocumentAttachment = require('../models/documentAttachments');

class DocumentAttachmentService {
    async create(data) {
        return await DocumentAttachment.create(data);
    }

    async getAll() {
        return await DocumentAttachment.findAll();
    }

    async getById(id) {
        return await DocumentAttachment.findByPk(id);
    }

    async update(id, data) {
        const attachment = await DocumentAttachment.findByPk(id);
        if (!attachment) return null;
        return await attachment.update(data);
    }

    async delete(id) {
        const attachment = await DocumentAttachment.findByPk(id);
        if (!attachment) return null;
        await attachment.destroy();
        return true;
    }

    async getByTypeId(typeId) {
        return await DocumentAttachment.findAll({ where: { type_id: typeId } });
    }

    async getByDepartmentId(departmentId) {
        return await DocumentAttachment.findAll({ where: { department_id: departmentId } });
    }

    async getByDisciplineId(disciplineId) {
        return await DocumentAttachment.findAll({ where: { discipline_id: disciplineId } });
    }

    async getByEduProgramId(eduProgramId) {
        return await DocumentAttachment.findAll({ where: { edu_program_id: eduProgramId } });
    }

    async getBySessionId(sessionId) {
        return await DocumentAttachment.findAll({ where: { session_id: sessionId } });
    }
}

module.exports = new DocumentAttachmentService();