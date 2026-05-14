// ============================================================
// complaintDB.js — Grievance / Complaint Management (API Version)
// ============================================================
// Handles: submitting, updating, closing, filtering complaints
// Uses API calls for MongoDB-backed data.
// ============================================================

var API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api';

/** In-memory complaint store */
var ComplaintDB = {
    allComplaints: [],
    nextComplaintId: 12361
};

/**
 * Submit a new complaint or update an existing one.
 * @param {Object} data  - The complaint object.
 * @param {boolean} isUpdate - True if updating.
 * @returns {string|null} The complaint ID, or null on failure.
 */
async function submitComplaintToDB(data, isUpdate) {
    try {
        const response = await fetch(`${API_BASE}/complaints/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, isUpdate })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            console.error('[complaintDB] Submit failed:', result.message || response.statusText);
        }
        return result.success ? result.id : null;
    } catch (error) {
        console.error('[complaintDB] Submit failed:', error);
        return null;
    }
}

/**
 * Retrieve a single complaint by ID.
 * @param {string} id
 * @returns {Object|undefined}
 */
async function getComplaintById(id) {
    try {
        const response = await fetch(`${API_BASE}/complaints/id/${id}`);
        const data = await response.json();
        return data.success ? data.complaint : undefined;
    } catch (error) {
        console.error('[complaintDB] Get by ID failed:', error);
        return undefined;
    }
}

/**
 * Retrieve complaints owned by a specific citizen.
 * @param {string} citizenName
 * @returns {Array}
 */
async function getComplaintsByCitizen(citizenName) {
    try {
        const response = await fetch(`${API_BASE}/complaints/citizen/${citizenName}`);
        const data = await response.json();
        return data.success ? data.complaints : [];
    } catch (error) {
        console.error('[complaintDB] Get by citizen failed:', error);
        return [];
    }
}

/**
 * Filter complaints for the Admin view.
 * @param {'All'|'New'|'Resolved'|'Escalated'|'Assigned'|'Pending'} statusFilter
 * @returns {Array}
 */
async function getComplaintsForAdminView(statusFilter) {
    try {
        const response = await fetch(`${API_BASE}/complaints/admin/${statusFilter}`);
        const data = await response.json();
        return data.success ? data.complaints : [];
    } catch (error) {
        console.error('[complaintDB] Get for admin view failed:', error);
        return [];
    }
}

/**
 * Close a complaint with admin/mukhiya remarks.
 * @param {string} id
 * @param {string} remarks
 * @returns {boolean}
 */
async function closeComplaint(id, remarks) {
    try {
        const response = await fetch(`${API_BASE}/complaints/close`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, remarks })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('[complaintDB] Close failed:', error);
        return false;
    }
}

/**
 * Update any field(s) of a complaint.
 * @param {string} id
 * @param {Object} updates  - Key-value pairs to merge.
 * @returns {boolean}
 */
async function updateComplaint(id, updates) {
    try {
        const response = await fetch(`${API_BASE}/complaints/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, updates })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('[complaintDB] Update failed:', error);
        return false;
    }
}

if (typeof window !== 'undefined') {
    window.updateComplaintInDB = updateComplaint;
}

// Keep SimulatedDB alias for backward-compatibility with existing scripts
var SimulatedDB = ComplaintDB;
