// ============================================================
// userDB.js — User Accounts & Session Management (API Version)
// ============================================================
// Handles: citizen & admin credentials, login state, profile
// Uses API calls for MongoDB-backed user data.
// ============================================================

var API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api';

var SESSION_USER_KEY = 'loggedInUser';



function saveSessionUser(user) {
    if (typeof window !== 'undefined') {
        window.__authUser = user;
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    }
}

/** Register a new citizen. */
async function registerCitizenToDB(name, email, password, phone) {
    return registerUserToDB(name, email, password, phone, 'citizen');
}

/** Register a user with a specific role. */
async function registerUserToDB(name, email, password, phone, role) {
    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone, role })
        });
        const data = await response.json();

        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/** Validate login and start session. */
async function loginUserToDB(email, password, role) {
    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: role || undefined })
        });
        const data = await response.json();

        if (data.success) {
            saveSessionUser(data.user);
        }
        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/** Get the currently logged-in user object from session */
function getLoggedInUser() {
    if (typeof window !== 'undefined' && window.__authUser) return window.__authUser;
    if (typeof window !== 'undefined') {
        const raw = sessionStorage.getItem(SESSION_USER_KEY);
        try { return raw ? JSON.parse(raw) : null; }
        catch (e) { return null; }
    }
    return null;
}

/** Clear the session (logout) */
function logoutUser() {
    if (typeof window !== 'undefined') {
        window.__authUser = null;
        sessionStorage.removeItem(SESSION_USER_KEY);
    }
}

// Signal that userDB is ready
if (typeof window !== 'undefined') {
    window.userDBReady = true;
}
