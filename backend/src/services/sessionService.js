// services/sessionService.js
const Session = require('../models/sessionsModel');

class SessionService {
    async create(data) {
        return await Session.create(data);
    }

    async getAll() {
        return await Session.findAll();
    }

    async getById(id) {
        return await Session.findByPk(id);
    }

    async update(id, data) {
        const session = await Session.findByPk(id);
        if (!session) return null;
        return await session.update(data);
    }

    async delete(id) {
        const session = await Session.findByPk(id);
        if (!session) return null;
        await session.destroy();
        return true;
    }

    async getByDisciplineId(disciplineId) {
        return await Session.findAll({ where: { discipline_id: disciplineId } });
    }

    async getByTeacherId(teacherId) {
        return await Session.findAll({ where: { teacher_id: teacherId } });
    }

    async getByDateRange(startDate, endDate) {
        return await Session.findAll({
            where: {
                session_date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });
    }
}

module.exports = new SessionService();