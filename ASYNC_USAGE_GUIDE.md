# Async Function Usage Guide

Since the database functions now use API calls (which are asynchronous), most DB functions are now `async` and return **Promises**. This guide explains how to use them.

## Async/Await Pattern

The recommended way to use DB functions is with `async/await`:

```javascript
// Define an async function
async function handleLogin() {
    const result = await loginUserToDB('email@example.com', 'password', 'citizen');
    if (result.success) {
        console.log('Login successful:', result.user);
    } else {
        console.log('Login failed:', result.message);
    }
}

// Call it
handleLogin();
```

## Checking Results

Always check the `.success` property:

```javascript
// User Registration
const registerResult = await registerCitizenToDB('John', 'john@email.com', 'pwd', '9999999999');
if (registerResult.success) {
    console.log('User registered');
} else {
    console.log('Registration error:', registerResult.message);
}

// Complaint Submission
const complaintId = await submitComplaintToDB(complaintData, false);
if (complaintId) {
    console.log('Complaint submitted with ID:', complaintId);
}

// Closing Complaint
const closed = await closeComplaint(complaintId, 'Resolved');
if (closed) {
    console.log('Complaint closed');
}
```

## Promise.then() Alternative

If you can't use `async/await`, use `.then()`:

```javascript
loginUserToDB('email@example.com', 'password', 'citizen')
    .then(result => {
        if (result.success) {
            console.log('Login successful');
        }
    })
    .catch(error => {
        console.error('API error:', error);
    });
```

## Error Handling

```javascript
async function safeLogin() {
    try {
        const result = await loginUserToDB('email@example.com', 'password', 'citizen');
        if (result.success) {
            // Handle success
        } else {
            // Handle business error (wrong credentials, etc)
            console.log('Error:', result.message);
        }
    } catch (error) {
        // Handle network/API errors
        console.error('Network error:', error);
    }
}
```

## Common DB Functions - Updated

### User Management
```javascript
// These are async now
const loginResult = await loginUserToDB(email, password, role);
const registerResult = await registerCitizenToDB(name, email, password, phone);

// These are still sync
const user = getLoggedInUser(); // synchronous
logoutUser(); // synchronous
```

### Complaints
```javascript
// All async
const id = await submitComplaintToDB(data, isUpdate);
const complaint = await getComplaintById(id);
const complaints = await getComplaintsByCitizen(citizenName);
const filtered = await getComplaintsForAdminView('New');
const closed = await closeComplaint(id, remarks);
const updated = await updateComplaint(id, updates);
```

### Chat
```javascript
// All async
const messages = await getMessages(channel, citizenName);
const msg = await sendMessage(channel, citizenName, sender, text);
const marked = await markMessagesAsRead(channel, citizenName, reader);
const count = await getUnreadCount(channel, citizenName, recipient);
const participants = await getChatParticipants(channel);
await deleteConversation(channel, citizenName);
```

### Announcements
```javascript
// All async
const announcements = await getAnnouncements();
const announcement = await postAnnouncement(title, body);
const deleted = await deleteAnnouncement(id);
```

### Funds
```javascript
// All async
const allocations = await getAllocations();
const summary = await getFundSummary();
const allocation = await addAllocation(projectName, category, amount);
const updated = await updateAllocationStatus(id, status);
```

## HTML Event Handlers

For inline event handlers in HTML, wrap the call:

```html
<!-- Before (with localStorage - synchronous) -->
<button onclick="submitForm()">Submit</button>

<!-- After (with API - asynchronous) -->
<button onclick="handleSubmit()">Submit</button>
```

```javascript
// JavaScript
async function handleSubmit() {
    const result = await submitComplaintToDB(data, false);
    if (result) {
        alert('Complaint submitted with ID: ' + result);
    }
}
```

## Concurrent Operations

Execute multiple DB operations in parallel:

```javascript
// Sequential (slower)
const user = await getLoggedInUser();
const complaints = await getComplaintsByCitizen(user.name);
const announcements = await getAnnouncements();

// Parallel (faster)
const [complaints, announcements] = await Promise.all([
    getComplaintsByCitizen(user.name),
    getAnnouncements()
]);
```

## Important Notes

1. **No blocking** - async functions don't freeze the UI
2. **Network errors** - May fail if server is down
3. **Timeouts** - Very slow requests may appear unresponsive
4. **Sessions** - Still stored in localStorage locally
5. **API_BASE** - Configured to `http://localhost:5000/api`

## Debugging

Enable console logs to see API calls:

```javascript
// In browser console
fetch('http://localhost:5000/api/health')
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);
```

For detailed API logs:
```javascript
// Override fetch to log all calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('API call:', args[0]);
    return originalFetch.apply(this, args);
};
```

## Migration Timeline

If you're updating existing HTML files to use the new async functions:

1. Identify all DB function calls
2. Wrap them in `async` functions or promise chains
3. Update event handlers to handle the async nature
4. Test each feature thoroughly

See existing files in `/Frontend/src/` for implementation examples.
