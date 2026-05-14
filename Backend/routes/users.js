const express = require('express');
const User = require('../models/User');
const router = express.Router();

const DEFAULT_USERS = [
  { id: 'citizen1', email: 'rahul@gmail.com', password: 'zxcvb', role: 'citizen', name: 'Rahul Kumar Rai' },
  { id: 'admin1', email: 'admin@gmail.com', password: 'zxcvb', role: 'admin', name: 'Admin Officer' },
  { id: 'mukhiya1', email: 'ravidash@gmail.com', password: 'zxcvb', role: 'mukhiya', name: 'Ravi Dash' }
];

// Initialize default users
async function initializeDefaultUsers() {
  for (const user of DEFAULT_USERS) {
    const existing = await User.findOne({ id: user.id });
    if (!existing) {
      await User.create(user);
    }
  }
}

// Initialize on startup
initializeDefaultUsers().catch(console.error);

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'citizen' } = req.body;

    if (!['citizen', 'admin', 'mukhiya'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const newUser = {
      id: role + '_' + Date.now(),
      name,
      email,
      password,
      phone: phone || 'N/A',
      role
    };

    const user = await User.create(newUser);
    res.json({ success: true, message: 'Registered successfully.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const query = { email, password };
    if (role) query.role = role;

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    res.json({ success: true, message: 'Login successful.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
