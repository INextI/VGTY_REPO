const eduProgramm = require('../models/eduProgrammModel')

class EduProgrammService {
    async createEduProgramm(data) {
        return await eduProgramm.create(data)
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