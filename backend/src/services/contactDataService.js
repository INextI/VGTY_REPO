// services/contactDataService.js
const ContactData = require('../models/contactDataModel');

class ContactDataService {
    async create(data) {
        return await ContactData.create(data);
    }

    async getAll() {
        return await ContactData.findAll();
    }

    async getById(id) {
        return await ContactData.findByPk(id);
    }

    async update(id, data) {
        const contact = await ContactData.findByPk(id);
        if (!contact) return null;
        return await contact.update(data);
    }

    async delete(id) {
        const contact = await ContactData.findByPk(id);
        if (!contact) return null;
        await contact.destroy();
        return true;
    }

    async getByPerson(personId, personType) {
        return await ContactData.findAll({
            where: {
                person_id: personId,
                person_type: personType
            }
        });
    }

    async getByType(typeId) {
        return await ContactData.findAll({ where: { type_id: typeId } });
    }

    async getByPersonAndType(personId, personType, typeId) {
        return await ContactData.findOne({
            where: {
                person_id: personId,
                person_type: personType,
                type_id: typeId
            }
        });
    }
}

module.exports = new ContactDataService();