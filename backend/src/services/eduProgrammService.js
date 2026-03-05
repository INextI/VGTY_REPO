const eduProgramm = require('../models/eduProgrammModel')
const facultyService = require('./facultyServices')
const educationalFormService = require('./educationFormService')

class EduProgrammService {
    async createEduProgramm(data) {
        const faculty = await facultyService.getFacultyByName(data.faculty)
        facultyId = faculty.id
        const eduForm = await educationalFormService.getEducationFormByName(data.education_form)
        educationFormId = eduForm.id
        return await eduProgramm.create({
            name: data.name,
            faculty_id: facultyId,
            education_form_id: educationFormId
        })
    }

    async getAllEduProgramms() {
        return await eduProgramm.findAll()
    }

    async getEduProgrammById(id) {
        return await eduProgramm.findByPk(id)
    }

    async updateEduProgramm(id, data) {
        const programm = await eduProgramm.findByPk(id)
        if (!programm) throw new Error("Направление не найдено")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await eduProgramm.update(data)
    }

    async deleteEduProgramm(id) {
        const programm = await eduProgramm.findByPk(id)
        if (!programm) throw new Error("Направление не найдено")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await programm.destroy()
        return { message: 'Удален'}
    }
}

module.exports = new EduProgrammService()