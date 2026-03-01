const express = require('express');
const router = express.Router();
const disciplineController = require('../controllers/disciplineController');
const upload = require('../config/multer')

router.get("/", disciplineController.getAllWithImage);
router.get("/light", disciplineController.getAllWithoutImage);

router.get("/:id", disciplineController.getByIdWithImage);
router.get("/:id/light", disciplineController.getByIdWithoutImage);

router.post("/", upload.single("image"), disciplineController.create);
router.put("/:id", upload.single("image"), disciplineController.update);
router.delete("/:id", disciplineController.delete);


module.exports = router