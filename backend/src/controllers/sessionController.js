// controllers/sessionController.js
const sessionService = require('../services/sessionService');

class SessionController {
    async create(req, res, next) {
        try {
            const session = await sessionService.create(req.body);
            return res.status(201).json(session);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const sessions = await sessionService.getAll();
            return res.status(200).json(sessions);
        } catch (e) {
            next(e);
        }
    }

    async getById(req, res, next) {
        try {
            const session = await sessionService.getById(req.params.id);
            if (!session) {
                return res.status(404).json({ message: 'Сессия не найдена' });
            }
            return res.status(200).json(session);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const session = await sessionService.update(req.params.id, req.body);
            if (!session) {
                return res.status(404).json({ message: 'Сессия не найдена' });
            }
            return res.status(200).json(session);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await sessionService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Сессия не найдена' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    async getByDisciplineId(req, res, next) {
        try {
            const sessions = await sessionService.getByDisciplineId(req.params.disciplineId);
            return res.status(200).json(sessions);
        } catch (e) {
            next(e);
        }
    }

    async getByTeacherId(req, res, next) {
        try {
            const sessions = await sessionService.getByTeacherId(req.params.teacherId);
            return res.status(200).json(sessions);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new SessionController();