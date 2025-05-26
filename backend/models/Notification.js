const mongoose = require('mongoose');

module.exports = mongoose.model('Notification', new mongoose.Schema({
  recipient: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['Sent', 'Seen'], default: 'Sent' }
}));
