require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grievance_dashboard';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
// Routes
app.use('/api/users', require('./Backend/routes/users'));
app.use('/api/complaints', require('./Backend/routes/complaints'));
app.use('/api/chats', require('./Backend/routes/chats'));
app.use('/api/announcements', require('./Backend/routes/announcements'));
app.use('/api/funds', require('./Backend/routes/funds'));


// Serve static files for the paths already used by the HTML pages.
app.use('/Frontend', express.static(path.join(__dirname, 'Frontend')));
app.use('/Backend/db', express.static(path.join(__dirname, 'Backend/db')));
app.get('/Backend/db.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'Backend/db.js'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend/src/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
