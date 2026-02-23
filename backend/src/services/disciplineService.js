const fs = require("fs");
const path = require("path");

const Discipline = require("../models/disciplineModel");
const { DEFAULT_DISCIPLINE_IMAGE, STATIC_PATH } = require("../config/storage");

class DisciplineService {

    async create(data, file) {
        const imageUrl = file
            ? `/static/img/discipline/${file.filename}`
            : DEFAULT_DISCIPLINE_IMAGE;

        const discipline = await Discipline.create({
            ...data,
            image_url: imageUrl
        });

        return discipline;
    }

    async getById(id) {
        const discipline = await Discipline.findByPk(id);

        if (!discipline) {
            throw new Error("Курс не найден");
        }

        return discipline;
    }

    async getAll() {
        return await Discipline.findAll();
    }

    async update(id, data, file) {
        const discipline = await Discipline.findByPk(id);

        if (!discipline) {
            throw new Error("Курс не найден");
        }

        let imageUrl = discipline.image_url;

        // Если пришла новая картинка
        if (file) {

            // Удаляем старую если она не дефолтная
            if (discipline.image_url &&
                discipline.image_url !== DEFAULT_IMAGE) {

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

    async delete(id) {
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




















/*
const Discipline = require('../models/disciplineModel')

class DisciplineService {
    async createDiscipline(data) {
        return await Discipline.create(data)
    }

    async getAllDisciplines() {
        return await Discipline.findAll()
    }

    async getDisciplineById(id) {
        return await Discipline.findByPk(id)
    }

    async updateDiscipline(id, data) {
        const discipline = await Discipline.findByPk(id)
        if (!discipline) throw new Error("Курс не найден")

        return await discipline.update(data)
    }

    async deleteDiscipline(id) {
        const discipline = await Discipline.findByPk(id)
        if (!discipline) throw new Error("Курс не найден")
        await discipline.destroy()
        return { message: 'Удалено'}
    }

    async getDisciplineByName(name) {
        const discipline = await Discipline.findOne({where: {name}})
        if (!discipline) throw new Error("Курс с таким именем не найден")
        return discipline
    }
}

module.exports = new DisciplineService()
*/