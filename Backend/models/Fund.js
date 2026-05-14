const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  projectName: String,
  category: String,
  amount: Number,
  status: {
    type: String,
    default: 'Active'
  },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString('en-GB')
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const fundSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  totalBudget: {
    type: Number,
    default: 5000000
  },
  allocations: [allocationSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'funds' });

module.exports = mongoose.model('Fund', fundSchema);
