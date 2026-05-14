// ============================================================
// fundDB.js — Fund Allocation / Panchayat Budget (API Version)
// ============================================================
// Handles: budget tracking, project allocations
// Uses API calls for MongoDB-backed data.
// ============================================================

var API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api';

/**
 * Get all fund allocations.
 * @returns {Array}
 */
async function getAllocations() {
    try {
        const response = await fetch(`${API_BASE}/funds/allocations`);
        const data = await response.json();
        return data.success ? data.allocations : [];
    } catch (error) {
        console.error('[fundDB] Get allocations failed:', error);
        return [];
    }
}

/**
 * Get fund summary (total, allocated, available).
 * @returns {{ totalBudget: number, allocated: number, available: number }}
 */
async function getFundSummary() {
    try {
        const response = await fetch(`${API_BASE}/funds/summary`);
        const data = await response.json();
        return data.success ? data.summary : { totalBudget: 0, allocated: 0, available: 0 };
    } catch (error) {
        console.error('[fundDB] Get fund summary failed:', error);
        return { totalBudget: 0, allocated: 0, available: 0 };
    }
}

/**
 * Add a new fund allocation.
 * @param {string} projectName
 * @param {string} category
 * @param {number} amount
 * @returns {Object|null} The saved allocation, or null if over budget
 */
async function addAllocation(projectName, category, amount) {
    try {
        const response = await fetch(`${API_BASE}/funds/allocations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName, category, amount })
        });
        const data = await response.json();
        return data.success ? data.allocation : null;
    } catch (error) {
        console.error('[fundDB] Add allocation failed:', error);
        return null;
    }
}

/**
 * Update the status of a fund allocation.
 * @param {string} id
 * @param {string} status
 * @returns {boolean}
 */
async function updateAllocationStatus(id, status) {
    try {
        const response = await fetch(`${API_BASE}/funds/allocations/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('[fundDB] Update allocation status failed:', error);
        return false;
    }
}
