const mongoose = require('mongoose');

module.exports = mongoose.model('Appointment', new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  startTime: String,
  endTime: String,
  attendees: [String],
  agenda: String,
  createdBy: String,
  status: {
    type: String,
    enum: ['Scheduled', 'Rescheduled', 'Cancelled'],
    default: 'Scheduled'
  }
}));
