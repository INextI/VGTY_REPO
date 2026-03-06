const fs = require("fs");
const path = require("path");

const Discipline = require("../models/disciplineModel");
const { DEFAULT_DISCIPLINE_IMAGE, STATIC_PATH } = require("../config/storage");
const facultyService = require('./facultyServices');
const educationFormService = require("./educationFormService");

class DisciplineService {

    async createDiscipline(data, file) {
        const faculty = await facultyService.getFacultyByName(data.faculty_name)
        const eduForm = await educationFormService.getEducationFormByName(data.education_form_name)
        const imageUrl = file
            ? `/static/img/discipline/${file.filename}`
            : DEFAULT_DISCIPLINE_IMAGE;

        const discipline = await Discipline.create({
            name: data.name,
            owner_employee_id: data.owner_employee_id,
            description: data.description,
            image_url: imageUrl,
            faculty_id: faculty.id,
            education_form_id: eduForm.id
        });

        return discipline;
    }

    async getDisciplineById(id) {
        const discipline = await Discipline.findByPk(id);

        if (!discipline) {
            throw new Error("Курс не найден");
        }

        return discipline;
    }

    async getAllDisciplines() {
        return await Discipline.findAll();
    }

    async updateDiscipline(id, data, file) {
        const discipline = await Discipline.findByPk(id);

        if (!discipline) {
            throw new Error("Курс не найден");
        }

        let imageUrl = discipline.image_url;

        // Если пришла новая картинка
        if (file) {

            // Удаляем старую если она не дефолтная
            if (discipline.image_url &&
                discipline.image_url !== DEFAULT_DISCIPLINE_IMAGE) {

                const oldImagePath = path.join(
                    STATIC_PATH,
                    discipline.image_url.replace("/static/", "")
                );

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            imageUrl = `/static/img/discipline/${file.filename}`;
        }

        await discipline.update({
            ...data,
            image_url: imageUrl
        });

        return discipline;
    }

    async deleteDiscipline(id) {
        const discipline = await Discipline.findByPk(id);

        if (!discipline) {
            throw new Error("Курс не найден");
        }

        // Удаляем файл если он не дефолтный
        if (discipline.image_url &&
            discipline.image_url !== DEFAULT_DISCIPLINE_IMAGE) {

            const filePath = path.join(
                STATIC_PATH,
                discipline.image_url.replace("/static/", "")
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await discipline.destroy();

        return { message: "Курс удален успешно" };
    }
}

module.exports = new DisciplineService();