const express = require('express');
const router = express.Router();
const disciplineController = require('../controllers/disciplineController');
const upload = require('../config/multer')
const authMiddleware = require('../middleware/authMiddleware')

const validate = require('../middleware/validationMiddlewaree')
const {
    createDisciplineSchema,
    updateDisciplineSchema
} = require('../validators/disciplineValidator')

const {idParamSchema} = require('../validators/common/idParamSchema')
const paginationSchema = require('../validators/common/pagination')

router.post("/", upload.single("image"), validate(createDisciplineSchema), disciplineController.create);
router.get('/my', authMiddleware, validate(paginationSchema, "query"), disciplineController.getMyDisciplines)
router.get("/", disciplineController.getAllWithImage);
//router.get("/light", disciplineController.getAllWithoutImage);

router.get("/:id", validate(idParamSchema, 'params'), disciplineController.getById);
//router.get("/:id/light", disciplineController.getByIdWithoutImage);
router.put(
    "/:id",
    upload.single("image"),
    validate(idParamSchema, 'params'),
    validate(updateDisciplineSchema), 
    disciplineController.update);
router.delete("/:id", validate(idParamSchema, 'params'), disciplineController.delete);


module.exports = router