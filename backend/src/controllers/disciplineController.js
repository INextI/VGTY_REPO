const disciplineService = require("../services/disciplineService");
const userService = require('../services/userService')

class DisciplineController {

    async create(req, res) {
        try {
            const discipline = await disciplineService.createDiscipline(
                req.body,
                req.file
            );

            res.status(201).json(discipline);

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllWithImage(req, res) {
        try {
            const disciplines = await disciplineService.getAllWithImage();
            res.json(disciplines);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllWithoutImage(req, res) {
        try {
            const disciplines = await disciplineService.getAllWithoutImage();

            const lightVersion = disciplines.map(d => {
                const obj = d.toJSON();
                delete obj.image_url;
                return obj;
            });

            res.json(lightVersion);

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getByIdWithImage(req, res) {
        try {
            const discipline = await disciplineService.getByIdWithImage(req.params.id);
            res.json(discipline);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

     async getAll(req, res, next) {
            try {
                const relations = await disciplineService.getAllDisciplines();
                return res.status(200).json(relations);
            } catch (e) {
                next(e);
            }
        }


    async getByIdWithoutImage(req, res) {
        try {
            const discipline = await disciplineService.getByIdWithoutImage(req.params.id);

            const obj = discipline.toJSON();
            delete obj.image_url;

            res.json(obj);

        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const discipline = await disciplineService.updateDiscipline(
                req.params.id,
                req.body,
                req.file
            );

            res.json(discipline);

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await disciplineService.deleteDiscipline(req.params.id);
            res.json(result);

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMyDisciplines(req, res, next) {

        try {
            const result = await userService.getUserDisciplines(
                req.user.id,
                req.query
            );

            res.json(result);

        } catch (e) {
            next(e);
        }

    }
}

module.exports = new DisciplineController();