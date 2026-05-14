// ============================================================
// auth.js — Route Guard / Auth Protection
// ============================================================
// Include this as the FIRST script on any protected page.
// It immediately redirects unauthenticated visitors to login.
//
// Usage:
//   <script src="/Backend/db/auth.js" data-role="citizen"></script>
//   <script src="/Backend/db/auth.js" data-role="admin"></script>
//   <script src="/Backend/db/auth.js" data-role="mukhiya"></script>
//
// Login page redirects:
//   citizen  → /Frontend/src/citizen/login.html
//   admin    → /Frontend/src/department/login.html
//   mukhiya  → /Frontend/src/mukhiya/login.html
// ============================================================

(function guardRoute() {
    const LOGIN_ROUTES = {
        citizen:  '/Frontend/src/citizen/login.html',
        admin:    '/Frontend/src/department/login.html',
        mukhiya:  '/Frontend/src/mukhiya/login.html'
    };

    // Determine which role this page requires
    const currentScript = document.currentScript;
    const requiredRole  = currentScript ? currentScript.getAttribute('data-role') : null;

    function getSession() {
        try {
            const raw = sessionStorage.getItem('loggedInUser');
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function redirect(role) {
        const target = LOGIN_ROUTES[role] || LOGIN_ROUTES.citizen;
        window.location.replace(target);
    }

    const session = getSession();

    if (!session) {
        // No session at all — redirect to the role's login page
        redirect(requiredRole || 'citizen');
        return;
    }

    if (requiredRole && session.role !== requiredRole) {
        // Logged in as wrong role (e.g. citizen trying to access admin)
        redirect(requiredRole);
        return;
    }

    // ✅ Authorised — expose session data for pages to use
    window.__authUser = session;

})();
