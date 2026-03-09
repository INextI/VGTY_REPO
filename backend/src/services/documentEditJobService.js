// services/documentEditJobService.js
const DocumentEditJob = require('../models/documentEditJobs');

class DocumentEditJobService {
    async create(data) {
        return await DocumentEditJob.create(data);
    }

    async getAll() {
        return await DocumentEditJob.findAll();
    }

    async getById(id) {
        return await DocumentEditJob.findByPk(id);
    }

    async update(id, data) {
        const job = await DocumentEditJob.findByPk(id);
        if (!job) return null;
        return await job.update(data);
    }

    async delete(id) {
        const job = await DocumentEditJob.findByPk(id);
        if (!job) return null;
        await job.destroy();
        return true;
    }

    async getByStatus(status) {
        return await DocumentEditJob.findAll({ where: { status } });
    }

    async getByEmployeeId(employeeId) {
        return await DocumentEditJob.findAll({ where: { created_by_employee_id: employeeId } });
    }

    async updateStatus(id, status, completedAt = null) {
        const job = await DocumentEditJob.findByPk(id);
        if (!job) return null;
        
        const updateData = { status };
        if (completedAt) {
            updateData.completed_at = completedAt;
        }
        
        return await job.update(updateData);
    }
}

module.exports = new DocumentEditJobService();