const AcademicYear = require('../models/academicYearModel')

class AcademicYearService {
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

    async getAcademicYearByValue(year) {
        const academicYear = await AcademicYear.findOne({where: {course_year: year}})
        if (!academicYear) throw new Error("Год не найден")

        return academicYear
    }
}

module.exports = new AcademicYearService()