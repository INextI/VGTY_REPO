const AcademicYear = require('../models/academicYearModel')

class AcademicYear {
    async createAcademicYear(data) {
        return await AcademicYear.create(data)
    }

    async getAllAcademicYears() {
        return await AcademicYear.findAll()
    }

    async getAcademicYearById(id) {
        return await AcademicYear.findByPk(id)
    }

    async deleteAcademicYear(id) {
        const academicYear = await AcademicYear.findByPk(id)
        if (!academicYear) throw new Error("Год не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await academicYear.destroy()
        return { message: 'Удален'}
    }
}

module.exports = new AcademicYear()