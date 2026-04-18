const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure cookie parser is active for JWT
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Configuration for views and EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the project root, so Frontend is accessible at /Frontend/
app.use('/Frontend', express.static(path.join(__dirname, '../Frontend')));

// Redirect root to the index page
app.get('/', (req, res) => {
    res.render('index');
});

// Setup dynamic routes matching legacy HTML structure
app.get('/Frontend/src/:role/:page.html', (req, res, next) => {
    const { role, page } = req.params;
    
    // Do not block the login pages!
    if(page === 'login') {
         return res.render(`${role}/login`);
    }

    // Call the auth middleware dynamically
    authMiddleware([role])(req, res, (err) => {
         if (err) return next(err); // Or redirect to login
         
         // Map existing structure accurately
         if (['department', 'citizen'].includes(role)) {
             res.render(`${role}/${page}`);
         } else {
             res.status(404).send('Not Found');
         }
    });
});

// Serve uploads if any
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File upload configuration using multer with tight validation limits
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error("File type not supported"), false);
    }
};
const upload = multer({ 
    storage, 
    fileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Auth Middleware
const authMiddleware = (roles = []) => {
    return (req, res, next) => {
         const token = req.cookies.token;
         
         const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');

         if(!token) {
             console.log("No token found");
             return isHtmlRequest ? res.redirect(`/Frontend/src/${roles[0] || 'citizen'}/login.html`) : res.status(401).json({error: "Unauthenticated"});
         }
         
         try {
             const decoded = jwt.verify(token, JWT_SECRET);
             if (roles.length && !roles.includes(decoded.role)) {
                 return isHtmlRequest ? res.redirect(`/Frontend/src/${roles[0] || 'citizen'}/login.html`) : res.status(403).json({ error: "Forbidden: Unauthorized Role" });
             }
             req.user = decoded;
             next();
         } catch(e) {
             return isHtmlRequest ? res.redirect(`/Frontend/src/${roles[0] || 'citizen'}/login.html`) : res.status(401).json({error: "Invalid token"});
         }
    };
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
     try {
          const { email, password, mobile, name, role, state, district, gender, block, panchayat, designation } = req.body;
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          
          const newUser = new User({ 
              email, 
              password: hashedPassword, 
              mobile,
              name, 
              role,
              state,
              district,
              gender,
              block,
              panchayat,
              designation
          });
          await newUser.save();
          res.json({ message: "Registered successfully" });
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
});

app.post('/api/auth/login', async (req, res) => {
     try {
          const { email, password } = req.body;
          const user = await User.findOne({ email });
          if(!user) return res.status(404).json({error: "User not found"});
          
          const valid = await bcrypt.compare(password, user.password);
          if(!valid) return res.status(401).json({error: "Invalid password"});
          
          const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
          res.cookie('token', token, { httpOnly: true, secure: false });
          res.json({ message: "Success", role: user.role });
     } catch(err) {
          res.status(500).json({ error: err.message });
     }
});


// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/grievance_dashboard')
.then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const Complaint = require('./models/Complaint');

// --- API ROUTES ---

// Get all complaints (Admin View)
app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get citizen history
app.get('/api/complaints/history', authMiddleware(['citizen', 'admin']), async (req, res) => {
    try {
        // Since original UI mock didn't bind explicit user IDs to complaints natively via the login mock, we will just fetch all for MVP. If they were bound, we'd use req.user.id
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.json(complaints);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new complaint (Citizen View)
app.post('/api/complaints', upload.single('file'), async (req, res) => {
    try {
        const { type, description, id, isUpdate } = req.body;
        
        let complaintID = id || ('RD' + Math.floor(Math.random() * 100000));
        let date = new Date().toLocaleDateString('en-GB');

        let attachmentName = 'None';
        let attachmentPath = '#';

        if (req.file) {
            attachmentName = req.file.originalname;
            // Map the path directly to serve the local uploaded file
            attachmentPath = '/uploads/' + req.file.filename;
        }

        let savedComplaint;
        if (isUpdate === 'true' && id) {
             savedComplaint = await Complaint.findOneAndUpdate(
                 { id: id },
                 {
                     type: type,
                     message: description,
                     ...(req.file && { attachmentName, attachmentPath }),
                     status: 'Under process (Updated)'
                 },
                 { new: true }
             );
             if(!savedComplaint) {
                  return res.status(404).json({ error: "Complaint not found for update" });
             }
             io.emit('complaintUpdated', savedComplaint); // Emit socket event to update Admin dashboards
        } else {
             const newComplaint = new Complaint({
                 id: complaintID,
                 type: type,
                 message: description,
                 attachmentName,
                 attachmentPath,
                 dateSubmitted: date,
                 status: 'New'
             });

             savedComplaint = await newComplaint.save();
             io.emit('newComplaint', savedComplaint); // Emit socket event to notify admins
        }

        res.status(201).json(savedComplaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update complaint status (Admin / System)
app.put('/api/complaints/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findOneAndUpdate(
            { id: req.params.id },
            { status: status },
            { new: true }
        );
        if(!complaint) return res.status(404).json({ error: "Complaint not found" });

        io.emit('complaintUpdated', complaint);
        res.json(complaint);
    } catch (err) {
         res.status(500).json({ error: err.message });
    }
});

// Get a single complaint by ID
app.get('/api/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findOne({ id: req.params.id });
        if(!complaint) return res.status(404).json({ error: "Complaint not found" });
        res.json(complaint);
    } catch (err) {
         res.status(500).json({ error: err.message });
    }
});

// --- SOCKET.IO CONNECTION ---
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
