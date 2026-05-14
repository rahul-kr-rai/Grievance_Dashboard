# Quick Start - MongoDB Migration

## What Was Done

Your Grievance Dashboard has been **fully migrated from localStorage to MongoDB**. All data is now stored in a centralized database instead of browser storage.

## Files Created

### Backend Core
- `server.js` - Express.js server
- `package.json` - Dependencies configuration
- `.env` - Environment variables (configure this!)
- `.gitignore` - Git ignore rules

### MongoDB Models
- `Backend/models/User.js` - User accounts
- `Backend/models/Complaint.js` - Complaints/grievances
- `Backend/models/Chat.js` - Messages
- `Backend/models/Announcement.js` - Announcements
- `Backend/models/Fund.js` - Budget allocations

### API Routes
- `Backend/routes/users.js` - User endpoints
- `Backend/routes/complaints.js` - Complaint endpoints
- `Backend/routes/chats.js` - Chat endpoints
- `Backend/routes/announcements.js` - Announcement endpoints
- `Backend/routes/funds.js` - Fund endpoints

### Database Wrappers (Updated)
- `Backend/db/userDB.js` - Now uses API
- `Backend/db/complaintDB.js` - Now uses API
- `Backend/db/chatDB.js` - Now uses API
- `Backend/db/announcementDB.js` - Now uses API
- `Backend/db/fundDB.js` - Now uses API

### Documentation
- `MONGODB_SETUP.md` - Detailed setup instructions
- `MIGRATION_SUMMARY.md` - What changed and what didn't
- `ASYNC_USAGE_GUIDE.md` - How to use async functions
- `QUICKSTART.md` - This file

## Installation (5 minutes)

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Start MongoDB

**Windows:**
```bash
mongod
# Or if installed as service:
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 3. Run the Server
```bash
npm start
# Or for development:
npm run dev
```

### 4. Open in Browser
```
http://localhost:5000
```

## Default Users

| Role | Email | Password |
|------|-------|----------|
| Citizen | rahul@gmail.com | zxcvb |
| Admin | admin@gmail.com | zxcvb |
| Mukhiya | ravidash@gmail.com | zxcvb |

## Key Changes

### For End Users
✅ **Nothing changes** - The app looks and works exactly the same!

### For Developers
⚠️ **DB functions are now async** - Use `await` when calling them:

```javascript
// Before (localStorage)
const complaints = getComplaintsByCitizen('Rahul');

// After (MongoDB)
const complaints = await getComplaintsByCitizen('Rahul');
```

## Data Migration

- Existing localStorage data is **not migrated**
- MongoDB starts fresh with no initial data
- Default users are seeded automatically
- All future data goes to MongoDB

## Architecture

```
Browser (Frontend)
    ↓ HTTP Requests
Express Server (Backend)
    ↓ Queries
MongoDB (Database)
    ↓ Data
```

## What Stays the Same

- ✅ All HTML/CSS in Frontend/src/
- ✅ All page layouts and styling
- ✅ All user interactions and workflows
- ✅ Authentication process (citizen/admin/mukhiya)
- ✅ Function names and behavior

## API Endpoints

### Users
```
POST   /api/users/register        - Register user
POST   /api/users/login           - Login
GET    /api/users                 - Get all users
GET    /api/users/:id             - Get one user
```

### Complaints
```
POST   /api/complaints/submit     - Submit/update
GET    /api/complaints/           - Get all
GET    /api/complaints/id/:id     - Get one
GET    /api/complaints/citizen/:name
GET    /api/complaints/admin/:filter
POST   /api/complaints/close      - Close
POST   /api/complaints/update     - Update fields
```

### Chats
```
GET    /api/chats/:channel/:citizen
POST   /api/chats/send
POST   /api/chats/mark-read
GET    /api/chats/unread/:channel/:citizen/:recipient
GET    /api/chats/participants/:channel
DELETE /api/chats/:channel/:citizen
```

### Announcements
```
GET    /api/announcements
POST   /api/announcements
DELETE /api/announcements/:id
```

### Funds
```
GET    /api/funds
GET    /api/funds/summary
GET    /api/funds/allocations
POST   /api/funds/allocations
PATCH  /api/funds/allocations/:id
```

## Troubleshooting

### Server won't start
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
→ MongoDB is not running. Start it first!

### Port 5000 in use
Edit `.env` and change `PORT=5000` to `PORT=5001`

### API calls failing
- Check network tab in browser DevTools
- Verify server is running
- Check `.env` configuration

## Next Steps

1. **Read documentation:**
   - `MONGODB_SETUP.md` - Full setup guide
   - `MIGRATION_SUMMARY.md` - Technical details
   - `ASYNC_USAGE_GUIDE.md` - How to use async

2. **Test the application:**
   - Login as each role
   - Submit complaints
   - Test all features

3. **Customize if needed:**
   - Update `.env` for production
   - Modify API_BASE for different server
   - Add authentication middleware

## Production Deployment

Before deploying:

1. Change default passwords
2. Use MongoDB Atlas (cloud)
3. Set `NODE_ENV=production` in `.env`
4. Enable HTTPS
5. Add API authentication
6. Deploy to hosting (Heroku, AWS, etc.)

## Support

For detailed information:
- Backend: See `server.js`
- Models: See `Backend/models/`
- Routes: See `Backend/routes/`
- Setup: See `MONGODB_SETUP.md`

Enjoy your updated Grievance Dashboard! 🎉
