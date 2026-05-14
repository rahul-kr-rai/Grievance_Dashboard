// ============================================================
// chatDB.js — Messaging / Chat Management (API Version)
// ============================================================
// Handles: Mukhiya ↔ Citizen chats, direct entity chats
// Uses API calls for MongoDB-backed data.
// ============================================================

var API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api';

/**
 * Get messages between a citizen and a channel.
 * @param {'mukhiya'|string} channel
 * @param {string} citizenName
 * @returns {Array}
 */
async function getMessages(channel, citizenName) {
    try {
        const response = await fetch(`${API_BASE}/chats/${channel}/${citizenName}`);
        const data = await response.json();
        return data.success ? data.messages : [];
    } catch (error) {
        console.error('[chatDB] Get messages failed:', error);
        return [];
    }
}

/**
 * Send a message in a channel.
 * @param {'mukhiya'|string} channel
 * @param {string} citizenName
 * @param {string} senderLabel - e.g. citizenName or 'Mukhiya'
 * @param {string} text
 * @returns {Object} The saved message object
 */
async function sendMessage(channel, citizenName, senderLabel, text) {
    try {
        const response = await fetch(`${API_BASE}/chats/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel, citizenName, senderLabel, text })
        });
        const data = await response.json();
        return data.success ? data.message : null;
    } catch (error) {
        console.error('[chatDB] Send message failed:', error);
        return null;
    }
}

/**
 * Mark all messages from the other party as read.
 * (Call when the recipient opens the chat window.)
 * @param {'mukhiya'|string} channel
 * @param {string} citizenName
 * @param {string} readerLabel - e.g. 'Mukhiya' or citizenName
 */
async function markMessagesAsRead(channel, citizenName, readerLabel) {
    try {
        const response = await fetch(`${API_BASE}/chats/mark-read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel, citizenName, readerLabel })
        });
        const data = await response.json();
        return data.success ? data.updated : false;
    } catch (error) {
        console.error('[chatDB] Mark as read failed:', error);
        return false;
    }
}

/**
 * Get count of unread messages for a specific recipient.
 * @param {'mukhiya'|string} channel
 * @param {string} citizenName
 * @param {string} recipientLabel - messages NOT from this label are "incoming"
 * @returns {number}
 */
async function getUnreadCount(channel, citizenName, recipientLabel) {
    try {
        const response = await fetch(`${API_BASE}/chats/unread/${channel}/${citizenName}/${recipientLabel}`);
        const data = await response.json();
        return data.success ? data.count : 0;
    } catch (error) {
        console.error('[chatDB] Get unread count failed:', error);
        return 0;
    }
}

/**
 * Get total unread message count across ALL citizens in a channel.
 * @param {'mukhiya'|string} channel
 * @param {string} recipientLabel - messages NOT from this label are "incoming"
 * @returns {number}
 */
async function getTotalUnreadCount(channel, recipientLabel) {
    try {
        const response = await fetch(`${API_BASE}/chats/unread-total/${channel}/${recipientLabel}`);
        const data = await response.json();
        return data.success ? data.total : 0;
    } catch (error) {
        console.error('[chatDB] Get total unread count failed:', error);
        return 0;
    }
}

/**
 * Get all citizen names who have chats in a channel.
 * @param {'mukhiya'|string} channel
 * @returns {string[]}
 */
async function getChatParticipants(channel) {
    try {
        const response = await fetch(`${API_BASE}/chats/participants/${channel}`);
        const data = await response.json();
        return data.success && Array.isArray(data.participants) ? data.participants : [];
    } catch (error) {
        console.error('[chatDB] Get participants failed:', error);
        return [];
    }
}

/**
 * Delete a conversation (for admin/cleanup use).
 * @param {'mukhiya'|string} channel
 * @param {string} citizenName
 */
async function deleteConversation(channel, citizenName) {
    try {
        const response = await fetch(`${API_BASE}/chats/${channel}/${citizenName}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('[chatDB] Delete conversation failed:', error);
        return false;
    }
}
