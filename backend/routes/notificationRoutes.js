const express =  require('express');
const {getAllNotification , updateMarkReadField} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/notification', authenticate, getAllNotification);
router.put('/updateReadStatus/:id', authenticate, updateMarkReadField);

module.exports = router;
