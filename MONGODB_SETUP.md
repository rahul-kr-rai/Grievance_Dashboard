# MongoDB Migration Setup Guide

## Overview
This Grievance Dashboard has been migrated from localStorage to MongoDB for better data persistence and multi-user access without conflicts.

## Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (Community or Atlas)
- **npm** or **yarn**

## Installation

### 1. Install Dependencies
```bash
cd "path/to/Grievance_Dashboard - Copy"
npm install
```

### 2. Set Up MongoDB

#### Option A: Local MongoDB
```bash
# On Windows (with MongoDB installed):
net start MongoDB

# On macOS:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Copy the connection string
4. Update `.env` file with the connection string

### 3. Configure Environment Variables
Edit `.env` file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/grievance_dashboard
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/grievance_dashboard
PORT=5000
NODE_ENV=development
```

### 4. Start the Server
```bash
# Development mode (with auto-reload)
npm install -g nodemon  # if not already installed
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Users
- `POST /api/users/register` - Register new citizen
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Complaints
- `POST /api/complaints/submit` - Submit or update complaint
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/id/:id` - Get complaint by ID
- `GET /api/complaints/citizen/:citizenName` - Get complaints by citizen
- `GET /api/complaints/admin/:statusFilter` - Get complaints by status filter
- `POST /api/complaints/close` - Close a complaint
- `POST /api/complaints/update` - Update complaint fields

### Chats
- `GET /api/chats/:channel/:citizenName` - Get messages
- `POST /api/chats/send` - Send message
- `POST /api/chats/mark-read` - Mark messages as read
- `GET /api/chats/unread/:channel/:citizenName/:recipientLabel` - Get unread count
- `GET /api/chats/participants/:channel` - Get chat participants
- `DELETE /api/chats/:channel/:citizenName` - Delete conversation

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Post new announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Funds
- `GET /api/funds` - Get fund data
- `GET /api/funds/summary` - Get fund summary
- `GET /api/funds/allocations` - Get allocations
- `POST /api/funds/allocations` - Add allocation
- `PATCH /api/funds/allocations/:id` - Update allocation status

## Default Users

The system automatically seeds default users on first run:

1. **Citizen**
   - Email: `rahul@gmail.com`
   - Password: `zxcvb`
   - Role: `citizen`

2. **Admin**
   - Email: `admin@gmail.com`
   - Password: `zxcvb`
   - Role: `admin`

3. **Mukhiya**
   - Email: `ravidash@gmail.com`
   - Password: `zxcvb`
   - Role: `mukhiya`

## Frontend Integration

The frontend automatically uses API calls instead of localStorage. The DB functions in `/Backend/db/*.js` now make HTTP requests to the backend.

### Example Usage

```javascript
// Login (now uses API)
const result = await loginUserToDB('rahul@gmail.com', 'zxcvb', 'citizen');
if (result.success) {
    console.log('Logged in as:', result.user.name);
}

// Submit complaint (now uses API)
const complaintId = await submitComplaintToDB(complaintData, false);

// Get announcements (now uses API)
const announcements = await getAnnouncements();
```

## Migration from localStorage

All localStorage data is automatically converted to MongoDB collections on first run:

- `users` collection - User accounts
- `complaints` collection - Grievances
- `chats` collection - Messages
- `announcements` collection - Panchayat announcements
- `funds` collection - Budget allocations

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check `.env` file configuration
- Verify network connectivity (for Atlas)

### Port Already in Use
Change `PORT` in `.env` to another port (e.g., 5001)

### API Not Responding
- Clear browser cache
- Check server logs for errors
- Restart the server

## Development

### Running Tests
```bash
npm test
```

### Stopping the Server
```bash
# Ctrl+C in terminal
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Deploy to hosting platform (Heroku, AWS, DigitalOcean, etc.)
3. Ensure MongoDB Atlas is used (or accessible from server)
4. Update API base URL in `/Backend/db/*.js` files if needed

## Security Notes

⚠️ **Important**: Never commit `.env` file with credentials!

- Change default passwords before production deployment
- Use environment variables for sensitive data
- Enable authentication in MongoDB Atlas
- Use HTTPS in production

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
