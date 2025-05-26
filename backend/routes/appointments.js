const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/appointmentController');
router.post('/', auth, ctrl.createAppointment);
router.get('/', auth, ctrl.getAppointments);
router.put('/:id/reschedule', auth, ctrl.rescheduleAppointment);
router.delete('/:id/cancel', auth, ctrl.cancelAppointment);
module.exports = router;

