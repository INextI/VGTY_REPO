// controllers/contactDataTypesController.js
const contactDataTypesService = require('../services/contactDataTypesService');

class ContactDataTypesController {
    async create(req, res, next) {
        try {
            const type = await contactDataTypesService.create(req.body);
            return res.status(201).json(type);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const types = await contactDataTypesService.getAll();
            return res.status(200).json(types);
        } catch (e) {
            next(e);
        }
    }

    async getById(req, res, next) {
        try {
            const type = await contactDataTypesService.getById(req.params.id);
            if (!type) {
                return res.status(404).json({ message: 'Тип контактных данных не найден' });
            }
            return res.status(200).json(type);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const type = await contactDataTypesService.update(req.params.id, req.body);
            if (!type) {
                return res.status(404).json({ message: 'Тип контактных данных не найден' });
            }
            return res.status(200).json(type);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await contactDataTypesService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Тип контактных данных не найден' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new ContactDataTypesController();