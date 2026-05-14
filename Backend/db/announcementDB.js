// ============================================================
// announcementDB.js — Panchayat Announcements (API Version)
// ============================================================
// Handles: broadcasting, retrieving announcements
// Uses API calls for MongoDB-backed data.
// ============================================================

var API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api';

/**
 * Get all announcements (newest first).
 * @returns {Array}
 */
async function getAnnouncements() {
    try {
        const response = await fetch(`${API_BASE}/announcements`);
        const data = await response.json();
        return data.success ? data.announcements : [];
    } catch (error) {
        console.error('[announcementDB] Get announcements failed:', error);
        return [];
    }
}

/**
 * Post a new announcement.
 * @param {string} title
 * @param {string} body
 * @returns {Object} The saved announcement object
 */
async function postAnnouncement(title, body) {
    try {
        const response = await fetch(`${API_BASE}/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body })
        });
        const data = await response.json();
        return data.success ? data.announcement : null;
    } catch (error) {
        console.error('[announcementDB] Post announcement failed:', error);
        return null;
    }
}

/**
 * Delete an announcement by ID.
 * @param {string} id
 * @returns {boolean}
 */
async function deleteAnnouncement(id) {
    try {
        const response = await fetch(`${API_BASE}/announcements/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('[announcementDB] Delete announcement failed:', error);
        return false;
    }
}
