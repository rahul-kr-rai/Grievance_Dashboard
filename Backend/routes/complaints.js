const express = require('express');
const Complaint = require('../models/Complaint');
const router = express.Router();

async function generateComplaintId() {
  let id;
  let exists;

  do {
    id = '#' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    exists = await Complaint.exists({ id });
  } while (exists);

  return id;
}

// Submit or update complaint
router.post('/submit', async (req, res) => {
  try {
    const { data, isUpdate } = req.body;

    if (!isUpdate) {
      const complaint = {
        id: await generateComplaintId(),
        ...data,
        status: 'New',
        dateSubmitted: new Date().toLocaleDateString('en-GB')
      };
      const result = await Complaint.create(complaint);
      return res.json({ success: true, id: result.id });
    } else {
      const complaint = await Complaint.findOne({ id: data.id });
      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found.' });
      }

      Object.assign(complaint, {
        type: data.type,
        message: data.message,
        attachmentName: data.attachmentName,
        attachmentPath: data.attachmentPath,
        status: 'In Progress (Updated)'
      });
      await complaint.save();
      res.json({ success: true, id: data.id });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get complaint by ID
router.get('/id/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get complaints by citizen
router.get('/citizen/:citizenName', async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizenName: req.params.citizenName });
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get complaints for admin view
router.get('/admin/:statusFilter', async (req, res) => {
  try {
    const { statusFilter } = req.params;
    const inProgressStatuses = ['In Progress', 'In Progress (Updated)', 'Waiting for Data', 'Under process (Updated)'];
    let query = {};

    switch (statusFilter) {
      case 'New':
        query = { status: 'New' };
        break;
      case 'Resolved':
        query = { status: { $in: ['Resolved', 'Closed'] } };
        break;
      case 'Escalated':
        query = { $or: [{ escalationLevel: { $gt: 0 } }, { status: 'Escalated' }] };
        break;
      case 'Assigned':
        query = { status: { $in: inProgressStatuses }, assignedOfficer: { $exists: true, $ne: null } };
        break;
      case 'Pending':
        query = { status: { $in: inProgressStatuses }, $or: [{ assignedOfficer: { $exists: false } }, { assignedOfficer: null }] };
        break;
      case 'All':
      default:
        query = {};
    }

    const complaints = await Complaint.find(query);
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Close complaint
router.post('/close', async (req, res) => {
  try {
    const { id, remarks } = req.body;
    const complaint = await Complaint.findOne({ id });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.status = 'Closed';
    complaint.closingRemarks = remarks;
    complaint.closedDate = new Date().toLocaleDateString('en-GB');
    await complaint.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update complaint
router.post('/update', async (req, res) => {
  try {
    const { id, updates } = req.body;
    const complaint = await Complaint.findOne({ id });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    Object.assign(complaint, updates);
    await complaint.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
