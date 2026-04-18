const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // The generated custom ID like 'RD12345'
  citizenName: { type: String, default: 'Anonymous' },
  type: { type: String, required: true },
  message: { type: String, required: true },
  attachmentName: { type: String, default: 'None' },
  attachmentPath: { type: String, default: '#' },
  dateSubmitted: { type: String }, // formatted string
  status: { type: String, default: 'Under process...' }, // New, In Progress, Resolved
  expectedResponse: { type: String, default: '14-Days' },
  assignedOfficer: { type: String, default: null },
  dateAssigned: { type: String, default: null },
  dateResolved: { type: String, default: null },
  escalationLevel: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
