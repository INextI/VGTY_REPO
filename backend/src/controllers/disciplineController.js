const disciplineService = require("../services/disciplineService");

class DisciplineController {

    async create(req, res) {
        try {
            const discipline = await disciplineService.create(
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
            const disciplines = await disciplineService.getAll();
            res.json(disciplines);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllWithoutImage(req, res) {
        try {
            const disciplines = await disciplineService.getAll();

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
            const discipline = await disciplineService.getById(req.params.id);
            res.json(discipline);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async getByIdWithoutImage(req, res) {
        try {
            const discipline = await disciplineService.getById(req.params.id);

            const obj = discipline.toJSON();
            delete obj.image_url;

            res.json(obj);

        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const discipline = await disciplineService.update(
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
            const result = await disciplineService.delete(req.params.id);
            res.json(result);

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new DisciplineController();


































/*

const disciplineService = require('../services/disciplineService')

class DisciplineController {
    async create(req, res, next) {
        try{
            const {name, owner_employee_id, description, image_url, department_id, education_form_id} = req.body
            const discipline = await disciplineService.createDiscipline(req.body)
            return res.status(201).json(discipline)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req,res, next) {
        try {
            const discipline = await disciplineService.getAllDisciplines()
            return res.json(discipline)
        } catch (e) {
            next(e)
        }
    }

    async getOne(req, res, next) {
        try {
            const discipline = await disciplineService.getDisciplineById(req.params.id)
            return res.json(discipline)
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const discipline = await disciplineService.updateDiscipline(req.params.id, req.body)
            return res.json(discipline)
        } catch (e) {
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const result = await disciplineService.deleteDiscipline(req.params.id)
            return res.json(result)
        } catch (e) {
            next(e)
        }
    }
}


module.exports = new DisciplineController()

*/