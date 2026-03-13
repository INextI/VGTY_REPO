const express = require('express');
const router = express.Router();

const controller = require("../controllers/assignmentFilesController")

const auth = require("../middleware/authMiddleware")
const validate = require("../middleware/validationMiddlewaree")

const {createFile} = require("../validators/assignmentFilesValidator")

const { idParamSchema } = require("../validators/common/idParamSchema")

// добавить файл
router.post(
    "/",
    auth,
    validate(createFile),
    controller.create
)

// файлы задания
router.get(
    "/assignment/:assignment_id",
    auth,
    controller.getByAssignment
)

// удалить файл
router.delete(
    "/:id",
    auth,
    validate(idParamSchema, "params"),
    controller.delete
)

module.exports = router