const Faculty = require('../models/facultyModel')

class FacultyService {
    async createFaculty(data) {
        return await Faculty.create(data)
    }

    async getAllFacultys() {
        return await Faculty.findAll()
    }

    async getFacultyById(id) {
        return await Faculty.findByPk(id)
    }

    async updateFaculty(id, data) {
        const faculty = await Faculty.findByPk(id)
        if (!faculty) throw new Error("Факультет не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        return await faculty.update(data)
    }

    async deleteFaculty(id) {
        const faculty = await Faculty.findByPk(id)
        if (!faculty) throw new Error("Факультет не найден")    // НАПИСАТЬ ПОТОМ ОШИБКУ ОТДЕЛЬНО

        await faculty.destroy()
        return { message: 'Удален'}
    }
}

module.exports = new FacultyService()