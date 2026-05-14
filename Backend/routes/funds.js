const express = require('express');
const Fund = require('../models/Fund');
const router = express.Router();

const DEFAULT_FUNDS = {
  totalBudget: 5000000,
  allocations: []
};

// Initialize default fund
async function initializeFunds() {
  let fund = await Fund.findOne();
  if (!fund) {
    fund = await Fund.create(DEFAULT_FUNDS);
  }
  return fund;
}

// Ensure fund is initialized
initializeFunds().catch(console.error);

// Get all allocations
router.get('/allocations', async (req, res) => {
  try {
    let fund = await Fund.findOne();
    if (!fund) {
      fund = await Fund.create(DEFAULT_FUNDS);
    }
    res.json({ success: true, allocations: fund.allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get fund summary
router.get('/summary', async (req, res) => {
  try {
    let fund = await Fund.findOne();
    if (!fund) {
      fund = await Fund.create(DEFAULT_FUNDS);
    }

    const allocated = fund.allocations.reduce((sum, a) => sum + (a.amount || 0), 0);
    res.json({
      success: true,
      summary: {
        totalBudget: fund.totalBudget,
        allocated,
        available: fund.totalBudget - allocated
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add allocation
router.post('/allocations', async (req, res) => {
  try {
    const { projectName, category, amount } = req.body;

    let fund = await Fund.findOne();
    if (!fund) {
      fund = await Fund.create(DEFAULT_FUNDS);
    }

    const allocated = fund.allocations.reduce((sum, a) => sum + (a.amount || 0), 0);
    const available = fund.totalBudget - allocated;

    if (amount > available) {
      return res.status(400).json({ success: false, message: 'Amount exceeds available budget.' });
    }

    const allocation = {
      id: 'FUND' + Date.now(),
      projectName,
      category,
      amount: Number(amount),
      status: 'Active',
      date: new Date().toLocaleDateString('en-GB')
    };

    fund.allocations.push(allocation);
    await fund.save();

    res.json({ success: true, allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update allocation status
router.patch('/allocations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let fund = await Fund.findOne();
    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund record not found.' });
    }

    const allocation = fund.allocations.find(a => a.id === id);
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found.' });
    }

    allocation.status = status;
    await fund.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get funds data
router.get('/', async (req, res) => {
  try {
    let fund = await Fund.findOne();
    if (!fund) {
      fund = await Fund.create(DEFAULT_FUNDS);
    }
    res.json({ success: true, fund });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
