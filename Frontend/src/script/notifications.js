// ============================================================
// notifications.js — Unified Bell Badge Notification Engine
// ============================================================
// Add to any page with:
//   <script src="/Frontend/src/script/notifications.js" data-role="admin|mukhiya|citizen"></script>
//
// Roles:
//   admin   → counts complaints with status 'New' (unseen by admin)
//   mukhiya → counts total unread citizen messages in mukhiya channel
//   citizen → counts unread Mukhiya replies for the logged-in citizen
// ============================================================

(function () {
    'use strict';

    const POLL_INTERVAL_MS = 5000;

    // ── Determine role from this script's data-role attribute ──
    const _selfScript = document.currentScript;
    const _role = (_selfScript ? (_selfScript.getAttribute('data-role') || '') : '').toLowerCase();

    // ── API base ──
    function apiBase() {
        return `${window.location.origin}/api`;
    }

    // ── Get logged-in citizen name (populated by auth.js / userDB.js) ──
    function getCitizenName() {
        if (typeof getLoggedInUser === 'function') {
            const u = getLoggedInUser();
            return u && u.name ? u.name : null;
        }
        if (window.__authUser && window.__authUser.name) return window.__authUser.name;
        return null;
    }

    // ── Inject badge CSS once ──
    function injectStyles() {
        if (document.getElementById('__notifStyles')) return;
        const s = document.createElement('style');
        s.id = '__notifStyles';
        s.textContent = `
            .notif-bell-wrapper{position:relative;display:inline-flex;align-items:center;}
            #__notifBadge{
                position:absolute;top:-7px;right:-10px;
                background:#ff3b3b;color:#fff;
                font-size:11px;font-weight:700;
                min-width:20px;height:20px;border-radius:50px;
                display:flex;align-items:center;justify-content:center;
                padding:0 4px;pointer-events:none;z-index:10;
                box-shadow:0 2px 6px rgba(255,59,59,.55);
                animation:__notifPop .3s cubic-bezier(.36,.07,.19,.97);
            }
            #__notifBadge.hidden{display:none!important;}
            @keyframes __notifPop{0%{transform:scale(0)}70%{transform:scale(1.3)}100%{transform:scale(1)}}
        `;
        document.head.appendChild(s);
    }

    // ── Attach badge span to the bell icon anchor ──
    function attachBadge() {
        if (document.getElementById('__notifBadge')) return; // already attached

        // Find the anchor that wraps a .fa-bell icon
        const bellAnchor = Array.from(
            document.querySelectorAll('.profile-section a, .profile-section .login-btn')
        ).find(a => a.querySelector('.fa-bell'));

        if (!bellAnchor) return;

        // Don't navigate on click; prevent default
        bellAnchor.addEventListener('click', e => e.preventDefault());
        bellAnchor.classList.add('notif-bell-wrapper');

        const badge = document.createElement('span');
        badge.id = '__notifBadge';
        badge.className = 'hidden';
        badge.textContent = '0';
        bellAnchor.appendChild(badge);
    }

    // ── Update badge count ──
    function updateBadge(count) {
        const badge = document.getElementById('__notifBadge');
        if (!badge) return;
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.classList.remove('hidden');
            badge.style.animation = 'none';
            void badge.offsetHeight;
            badge.style.animation = '__notifPop .3s cubic-bezier(.36,.07,.19,.97)';
        } else {
            badge.classList.add('hidden');
        }
    }

    // ── Fetch functions per role ──
    async function fetchAdminCount() {
        try {
            const r = await fetch(`${apiBase()}/complaints`);
            const d = await r.json();
            if (!d.success) return 0;
            return (d.complaints || []).filter(c => c.status === 'New').length;
        } catch { return 0; }
    }

    async function fetchMukhiyaCount() {
        try {
            const r = await fetch(`${apiBase()}/chats/unread-total/mukhiya/Mukhiya`);
            const d = await r.json();
            return d.success ? (d.total || 0) : 0;
        } catch { return 0; }
    }

    // Citizen: unread messages where sender !== citizenName (i.e., messages FROM Mukhiya)
    async function fetchCitizenCount(citizenName) {
        if (!citizenName) return 0;
        try {
            const enc = encodeURIComponent(citizenName);
            // recipientLabel = citizenName → counts messages NOT sent by citizen (= Mukhiya replies)
            const r = await fetch(`${apiBase()}/chats/unread/mukhiya/${enc}/${enc}`);
            const d = await r.json();
            return d.success ? (d.count || 0) : 0;
        } catch { return 0; }
    }

    // ── Single poll cycle ──
    async function poll(role, citizenName) {
        let count = 0;
        if (role === 'admin')        count = await fetchAdminCount();
        else if (role === 'mukhiya') count = await fetchMukhiyaCount();
        else if (role === 'citizen') count = await fetchCitizenCount(citizenName);
        updateBadge(count);
    }

    // ── Main boot ──
    let _timer = null;

    function startPolling(role) {
        injectStyles();
        attachBadge();

        let citizenName = role === 'citizen' ? getCitizenName() : null;

        // First immediate poll
        poll(role, citizenName);

        // If citizen name not yet resolved, retry after dbReady event
        if (role === 'citizen' && !citizenName) {
            window.addEventListener('dbReady', function onDbReady() {
                citizenName = getCitizenName();
                poll(role, citizenName);
                window.removeEventListener('dbReady', onDbReady);
            });
        }

        if (_timer) clearInterval(_timer);
        _timer = setInterval(() => {
            // Re-resolve citizen name on each tick in case login completed after boot
            if (role === 'citizen') citizenName = getCitizenName() || citizenName;
            poll(role, citizenName);
        }, POLL_INTERVAL_MS);

        // Expose manual refresh so other scripts (e.g. after marking read) can call it
        window.refreshNotifBadge = () => poll(role, citizenName);
    }

    // ── On DirectConnect pages the Mukhiya badge already exists; sync them ──
    function syncExistingMukhiyaBadge() {
        const existingBadge = document.getElementById('notifBadge'); // DirectConnect.html badge
        if (!existingBadge) return;
        // Override updateBadge to also update the existing badge
        const _origUpdate = updateBadge;
        window.updateBadge = function (count) {
            _origUpdate(count);
            if (count > 0) {
                existingBadge.textContent = count > 99 ? '99+' : String(count);
                existingBadge.classList.remove('hidden');
            } else {
                existingBadge.classList.add('hidden');
            }
        };
    }

    // ── Entry point ──
    function init() {
        if (!_role) return; // No role set — skip silently

        // On Mukhiya DirectConnect, #notifBadge is already injected by DirectConnect.html styles.
        // We hook into it instead of creating a duplicate.
        if (_role === 'mukhiya') syncExistingMukhiyaBadge();

        startPolling(_role);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external use
    window.__notif = { updateBadge, poll };
})();
