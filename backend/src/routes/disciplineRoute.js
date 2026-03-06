const express = require('express');
const router = express.Router();
const disciplineController = require('../controllers/disciplineController');
const upload = require('../config/multer')

const validate = require('../middleware/validationMiddleware')
const {
    createDisciplineSchema,
    updateDisciplineSchema
} = require('../validators/disciplineValidator')

const {idParamSchema} = require('../validators/common/idParamSchema')

router.get("/", disciplineController.getAllWithImage);
router.get("/light", disciplineController.getAllWithoutImage);

router.get("/:id", validate(idParamSchema, 'params'), disciplineController.getByIdWithImage);
router.get("/:id/light", disciplineController.getByIdWithoutImage);

router.post("/", upload.single("image"), validate(createDisciplineSchema), disciplineController.create);
router.put(
    "/:id",
    upload.single("image"),
    validate(idParamSchema, 'params'),
    validate(updateDisciplineSchema), 
    disciplineController.update);
router.delete("/:id", validate(idParamSchema, 'params'), disciplineController.delete);


module.exports = router