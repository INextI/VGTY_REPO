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
        if (!eduForm) throw new Error("Направление не найдено")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await educationForm.update(data)
    }

    async deleteEducationForm(id) {
        const eduForm = await educationForm.findByPk(id)
        if (!eduForm) throw new Error("Направление не найдено")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await eduForm.destroy()
        return { message: 'Удален'}
    }
}

module.exports = new EducationFormService()