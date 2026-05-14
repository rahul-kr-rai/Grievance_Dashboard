# Installation & Running Guide

## Prerequisites
- **Node.js** v14+ installed
- **MongoDB** Community Edition installed locally OR MongoDB Atlas account
- **npm** or **yarn** package manager

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd "path/to/Grievance_Dashboard - Copy"
npm install
```

### 2. Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (if MongoDB is installed as service)
net start MongoDB

# Or run mongod directly
mongod
```

**Option B: MongoDB Atlas (Cloud)**
Update `.env` with your connection string from MongoDB Atlas

### 3. Run the Backend Server
```bash
npm start
```

**Expected Output:**
```
MongoDB connected successfully
Server running on http://localhost:5000
```

### 4. Open in Browser
Navigate to: **http://localhost:5000**

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Citizen | rahul@gmail.com | zxcvb |
| Admin | admin@gmail.com | zxcvb |
| Mukhiya | ravidash@gmail.com | zxcvb |

## Development Mode (with Auto-Reload)

```bash
npm install -g nodemon
npm run dev
```

Server will auto-restart on file changes.

## Troubleshooting

### MongoDB not found
```bash
# Install MongoDB Community Edition
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb
```

### Port 5000 already in use
Edit `.env`:
```
PORT=5001
```

### API calls failing
1. Check server is running
2. Verify `.env` has correct `MONGODB_URI`
3. Check browser console for errors
4. Run health check:
   ```
   curl http://localhost:5000/api/health
   ```

## Project Structure

```
Grievance_Dashboard - Copy/
├── Backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   └── db/               # Frontend-compatible wrappers
├── Frontend/
│   └── src/
│       ├── citizen/      # Citizen portal
│       ├── department/   # Admin dashboard
│       ├── mukhiya/      # Mukhiya portal
│       ├── script/       # JavaScript (updated for async)
│       ├── css/          # Stylesheets
│       └── image/        # Assets
├── server.js             # Express entry point
├── package.json          # Dependencies
├── .env                  # Configuration
└── FRONTEND_INTEGRATION_GUIDE.md  # Detailed changes
```

## Documentation Files

Read these for more information:

1. **QUICKSTART.md** - 5-minute overview
2. **MONGODB_SETUP.md** - Detailed setup instructions
3. **MIGRATION_SUMMARY.md** - What changed
4. **ASYNC_USAGE_GUIDE.md** - How to use async functions
5. **FRONTEND_INTEGRATION_GUIDE.md** - Frontend changes explained

## Key Features Now Working

✅ Users can register and login  
✅ Citizens can submit/update/cancel complaints  
✅ Complaints persisted in MongoDB  
✅ Admin dashboard with live charts  
✅ Mukhiya can take actions (resolve/escalate)  
✅ Direct chat between Mukhiya and citizens  
✅ Announcements system  
✅ Fund allocation tracking  
✅ Real-time data from MongoDB  

## API Documentation

All endpoints: `http://localhost:5000/api/`

See **MONGODB_SETUP.md** for complete API reference.

## Common Tasks

### Add a new complaint
```bash
# Via UI: Login as citizen → Raise New Complaint

# Via API:
curl -X POST http://localhost:5000/api/complaints/submit \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "citizenName": "John",
      "type": "Road",
      "message": "Pothole issue"
    },
    "isUpdate": false
  }'
```

### View all complaints
```bash
curl http://localhost:5000/api/complaints
```

### Login
```bash
# Via UI: Go to login page

# Via API:
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul@gmail.com",
    "password": "zxcvb",
    "role": "citizen"
  }'
```

## Production Deployment

### Before deploying:
1. Update credentials in `.env`
2. Use MongoDB Atlas for database
3. Set `NODE_ENV=production`
4. Add API authentication
5. Enable HTTPS

### Deploy to Heroku:
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_url

# Deploy
git push heroku main
```

## Support

For issues:
1. Check error messages in console
2. Read ASYNC_USAGE_GUIDE.md for async patterns
3. Inspect MongoDB data using MongoDB Compass
4. Check API responses in Network tab

## What's Next?

1. ✅ MongoDB backend ready
2. ✅ API endpoints working
3. ✅ Frontend integrated with async calls
4. 📍 You are here: Testing locally
5. ⬜ Deploy to production
6. ⬜ Add new features

Enjoy your updated Grievance Dashboard! 🎉
