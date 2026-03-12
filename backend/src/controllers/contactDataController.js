// controllers/contactDataController.js
const contactDataService = require('../services/contactDataService');

class ContactDataController {
    async create(req, res, next) {
        try {
            const contact = await contactDataService.create(req.body);
            return res.status(201).json(contact);
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const contacts = await contactDataService.getAll();
            return res.status(200).json(contacts);
        } catch (e) {
            next(e);
        }
    }

    async getById(req, res, next) {
        try {
            const contact = await contactDataService.getById(req.params.id);
            if (!contact) {
                return res.status(404).json({ message: 'Контактные данные не найдены' });
            }
            return res.status(200).json(contact);
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const contact = await contactDataService.update(req.params.id, req.body);
            if (!contact) {
                return res.status(404).json({ message: 'Контактные данные не найдены' });
            }
            return res.status(200).json(contact);
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await contactDataService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Контактные данные не найдены' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }

    async getByPerson(req, res, next) {
        try {
            const { personId, personType } = req.params;
            const contacts = await contactDataService.getByPerson(personId, personType);
            return res.status(200).json(contacts);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new ContactDataController();