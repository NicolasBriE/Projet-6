const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const controllerSauces = require('../controllers/sauces')

router.get('/', auth, controllerSauces.getAllSauces);
router.get('/:id', auth, controllerSauces.getOneSauce);
router.post('/', auth, multer, controllerSauces.createSauce);
router.post('/:id/like', auth, controllerSauces.likesAndDislikes);
router.delete('/:id', auth, multer, controllerSauces.deleteSauce);
router.put('/:id', auth, multer, controllerSauces.modifySauce);

module.exports = router