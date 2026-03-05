const educationForm = require('../models/educationFormModel')

class EducationFormService {
    async createEducationForm(data) {
        return await educationForm.create(data)
    }

    async getAllEducationForms() {
        return await educationForm.findAll()
    }

    async getEducationFormById(id) {
        return await educationForm.findByPk(id)
    }

    async updateEducationForm(id, data) {
        const eduForm = await educationForm.findByPk(id)
        if (!eduForm) throw new Error("Форма обучения не найдена")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await educationForm.update(data)
    }

    async deleteEducationForm(id) {
        const eduForm = await educationForm.findByPk(id)
        if (!eduForm) throw new Error("Форма обучения не найдена")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await eduForm.destroy()
        return { message: 'Удален'}
    }

    async getEducationFormByName(name) {
        const eduForm = await educationForm.findOne({where: {name}})
        if (!eduForm) throw new Error("Форма обучения не найдена")
        return eduForm
    }
}

module.exports = new EducationFormService()