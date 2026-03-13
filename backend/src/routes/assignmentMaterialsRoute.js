const express = require('express');
const router = express.Router();

const controller = require("../controllers/assignmentMaterialsController")

const auth = require("../middleware/authMiddleware")
const validate = require("../middleware/validationMiddlewaree")

const {createMaterial} = require("../validators/assignmentMaterialsValidator")

const { idParamSchema } = require("../validators/common/idParamSchema")

// создать материал
router.post(
    "/",
    auth,
    validate(createMaterial),
    controller.create
)

// материалы задания
router.get(
    "/assignment/:assignment_id",
    auth,
    controller.getByAssignment
)

// удалить материал
router.delete(
    "/:id",
    auth,
    validate(idParamSchema, "params"),
    controller.delete
)

module.exports = router