const express =  require('express');
const {getAllNotification , updateMarkReadField} = require('../controllers/notificationController');

const router = express(express.Router());

router.get('/notification' , getAllNotification);
router.put('/updateReadStatus/:id' , updateMarkReadField);

module.exports = router;