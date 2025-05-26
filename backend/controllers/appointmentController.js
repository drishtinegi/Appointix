const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

exports.createAppointment = async (req, res) => {
  const { title, description, date, startTime, endTime, attendees, agenda } = req.body;

  if (!title || !date || !startTime || !endTime || !attendees?.length) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const conflict = await Appointment.findOne({
      date,
      attendees: { $in: attendees },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $ne: 'Cancelled' }
    });
    if (conflict) return res.status(409).json({ message: 'Time slot already booked.' });

    const appointment = await Appointment.create({
      title, description, date, startTime, endTime, attendees, agenda,
      createdBy: req.user.email
    });

    await Notification.insertMany(attendees.map(email => ({
      recipient: email,
      message: `New meeting scheduled: ${title}`
    })));

    req.io.emit('receive-invite', { attendees, title });

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating appointment', error: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments', error: err.message });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  const { id } = req.params;
  const { newDate, newStartTime, newEndTime } = req.body;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const conflict = await Appointment.findOne({
      _id: { $ne: id },
      date: newDate,
      attendees: { $in: appointment.attendees },
      startTime: { $lt: newEndTime },
      endTime: { $gt: newStartTime },
      status: { $ne: 'Cancelled' }
    });
    if (conflict) return res.status(409).json({ message: 'Conflicting appointment exists.' });

    appointment.date = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.status = 'Rescheduled';
    await appointment.save();

    req.io.emit('appointment-rescheduled', appointment);

    res.status(200).json({ message: 'Appointment rescheduled', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Error rescheduling', error: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Not found' });

    req.io.emit('appointment-cancelled', appointment);

    res.status(200).json({ message: 'Cancelled', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling', error: err.message });
  }
};
