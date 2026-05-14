const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  citizenName: String,
  citizenEmail: String,
  citizenPhone: String,
  type: String,
  message: String,
  attachmentName: String,
  attachmentPath: String,
  status: {
    type: String,
    default: 'New'
  },
  escalationLevel: {
    type: Number,
    default: 0
  },
  assignedOfficer: String,
  forwardedBy: String,
  forwardedDate: String,
  forwardingRemarks: String,
  dateResolved: String,
  resolutionRemarks: String,
  citizenRating: Number,
  citizenFeedback: String,
  closingRemarks: String,
  closedDate: String,
  dateSubmitted: {
    type: String,
    default: () => new Date().toLocaleDateString('en-GB')
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

complaintSchema.pre('save', function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
