const express = require('express');
const router = express.Router();
const eduProgrammController = require('../controllers/eduProgrammController');

router.post('/', eduProgrammController.create)
router.get('/', eduProgrammController.getAll)
router.get('/:id', eduProgrammController.getOne)
router.put('/:id', eduProgrammController.update)
router.delete('/:id', eduProgrammController.delete)


module.exports = router