// services/documentEditJobLogService.js
const DocumentEditJobLog = require('../models/documentEditJobLogs');

class DocumentEditJobLogService {
    async create(data) {
        return await DocumentEditJobLog.create(data);
    }

    async getAll() {
        return await DocumentEditJobLog.findAll();
    }

    async getById(id) {
        return await DocumentEditJobLog.findByPk(id);
    }

    async update(id, data) {
        const log = await DocumentEditJobLog.findByPk(id);
        if (!log) return null;
        return await log.update(data);
    }

    async delete(id) {
        const log = await DocumentEditJobLog.findByPk(id);
        if (!log) return null;
        await log.destroy();
        return true;
    }

    async getByJobId(jobId) {
        return await DocumentEditJobLog.findAll({ where: { job_id: jobId } });
    }

    async getByDocumentAttachmentId(documentAttachmentId) {
        return await DocumentEditJobLog.findAll({ where: { document_attachment_id: documentAttachmentId } });
    }

    async getByStatus(status) {
        return await DocumentEditJobLog.findAll({ where: { status } });
    }
}

module.exports = new DocumentEditJobLogService();