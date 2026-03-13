const fs = require("fs");
const path = require("path");

const { Student, Group, Discipline } = require('../models/index');
const { DEFAULT_DISCIPLINE_IMAGE, STATIC_PATH } = require("../config/storage");
const groupService = require('./groupService');
const educationFormService = require("./educationFormService");

class DisciplineService {

    async createDiscipline(data, file) {
        const group = await groupService.getGroupByName(data.group_name)
        const eduForm = await educationFormService.getEducationFormByName(data.education_form_name)
        const imageUrl = file
            ? `/static/img/discipline/${file.filename}`
            : DEFAULT_DISCIPLINE_IMAGE;

        const discipline = await Discipline.create({
            name: data.name,
            owner_employee_id: data.owner_employee_id,
            description: data.description,
            image_url: imageUrl,
            education_form_id: eduForm.id
        });

        await discipline.addGroup(group.id)

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

    async getDisciplineByGroup(groupId, pagination) {
        const { page, limit} = pagination;
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;

        const offset = (pageNum - 1) * limitNum;

        const {rows, count} = await Discipline.findAndCountAll({
            include: {
                model: Group,
                where: {id: groupId},
                attributes: []
            },
            limit,
            offset,
        });

        return {
            data: rows,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count/limit)
            }
        };
    }

    async getDisciplineByEmployee(employeeId, pagination) {
        const {page, limit} = pagination;
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;

        const offset = (pageNum - 1) * limitNum;

        const {rows, count} = await Discipline.findAndCountAll({
            where: {
                owner_employee_id: employeeId
            },
            limit,
            offset
        });

        return {
            data: rows,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count/limit)
            }
        }
    }

    async getFullCourse(discipline_id, user) {

        const includeAssignments = {
            model: Assignment,
            include: [
                {
                    model: AssignmentMaterials
                },
                {
                    model: AssignmentFiles
                }
            ]
        }

        // если студент → показываем только его submission
        if (user.role === "student") {

            includeAssignments.include.push({
                model: AssignmentSubmission,
                where: {
                    student_id: user.student_id
                },
                required: false
            })

        }

        // если преподаватель → показываем все submission
        if (user.role === "teacher") {

            includeAssignments.include.push({
                model: AssignmentSubmission,
                include: [
                    {
                        model: Student,
                        attributes: ["id", "first_name", "last_name"]
                    }
                ]
            })

        }

        const course = await Discipline.findByPk(discipline_id, {

            include: [
                includeAssignments
            ]

        })

        if (!course) {
            throw new Error("Course not found")
        }

        return course
    }

}

module.exports = new DisciplineService();