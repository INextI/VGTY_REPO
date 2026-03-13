const express = require('express');
const router = express.Router();

const controller = require("../controllers/assignmentController")

const authMiddleware = require("../middleware/authMiddleware")
const validate = require("../middleware/validationMiddlewaree")

const { idParamSchema } = require("../validators/common/idParamSchema")

const {createAssignment,
    updateAssignment,
    createFullAssignment
} = require("../validators/assignmentValidator")

// создать задание
router.post(
    "/",
    authMiddleware,
    validate(createAssignment),
    controller.create
)

// создать задание с файлами и материалами
router.post(
    "/full",
    authMiddleware,
    validate(createFullAssignment),
    controller.createFull
)

// получить задания дисциплины
router.get(
    "/",
    authMiddleware,
    controller.getAll
)

// получить одно задание
router.get(
    "/:id",
    authMiddleware,
    validate(idParamSchema, "params"),
    controller.getOne
)

// обновить задание
router.patch(
    "/:id",
    authMiddleware,
    validate(idParamSchema, "params"),
    validate(updateAssignment),
    controller.update
)

// удалить задание
router.delete(
    "/:id",
    authMiddleware,
    validate(idParamSchema, "params"),
    controller.delete
)

module.exports = router