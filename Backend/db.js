// ============================================================
// db.js — Master Database Entry Point
// ============================================================
//
// Loads all database modules sequentially, then fires a
// 'dbReady' CustomEvent on window so that render functions
// in main.js can safely use SimulatedDB without race conditions.
//
// Module map:
//   db/userDB.js         — User accounts & session
//   db/complaintDB.js    — Grievance / complaint CRUD
//   db/chatDB.js         — Mukhiya <-> Citizen messaging
//   db/announcementDB.js — Panchayat announcements
//   db/fundDB.js         — Budget & fund allocation
// ============================================================

(function loadDatabaseModules() {
    const BASE = '/Backend/db/';
    const modules = [
        'userDB.js',
        'complaintDB.js',
        'chatDB.js',
        'announcementDB.js',
        'fundDB.js'
    ];

    let loadedCount = 0;
    const total = modules.length;

    // Load modules one-by-one (sequential). Each script's onload
    // triggers the next, so load ORDER is guaranteed.
    // Only after the LAST script finishes do we fire 'dbReady'.
    function loadNext(index) {
        if (index >= total) return;

        var script = document.createElement('script');
        script.src = BASE + modules[index];

        script.onload = function () {
            loadedCount++;
            if (loadedCount === total) {
                // All DB modules are ready — signal the rest of the app
                window.dbReady = true;
                window.dispatchEvent(new CustomEvent('dbReady'));
                console.log('[db.js] All DB modules loaded. dbReady fired.');
            } else {
                loadNext(index + 1);
            }
        };

        script.onerror = function () {
            console.error('[db.js] Failed to load: ' + modules[index]);
            loadedCount++;
            // Still advance so dbReady eventually fires even on partial failure
            if (loadedCount === total) {
                window.dbReady = true;
                window.dispatchEvent(new CustomEvent('dbReady'));
            } else {
                loadNext(index + 1);
            }
        };

        document.head.appendChild(script);
    }

    loadNext(0);
})();

// ============================================================
// BACKWARD COMPATIBILITY SHIM
// ============================================================
// complaintDB.js sets: const SimulatedDB = ComplaintDB;
// All existing SimulatedDB.allComplaints references still work.
// ============================================================