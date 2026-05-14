// ============================================================
// popup.js — Global Toast / Popup Notification System
// ============================================================
// Replaces all native alert() calls with beautiful toasts.
//
// Usage:
//   showPopup('Your message here')                    // default: success
//   showPopup('Something went wrong', 'error')
//   showPopup('Please fill all fields', 'warning')
//   showPopup('New message received', 'info')
//
// Types: 'success' | 'error' | 'warning' | 'info'
// ============================================================

(function () {
    // Inject the CSS link if not already present
    if (!document.getElementById('popup-css')) {
        const link = document.createElement('link');
        link.id = 'popup-css';
        link.rel = 'stylesheet';
        link.href = '/Frontend/src/css/popup.css';
        document.head.appendChild(link);
    }

    // Create the container once
    function getContainer() {
        let c = document.getElementById('popup-container');
        if (!c) {
            c = document.createElement('div');
            c.id = 'popup-container';
            document.body.appendChild(c);
        }
        return c;
    }

    const ICONS = {
        success: '✅',
        error:   '❌',
        warning: '⚠️',
        info:    'ℹ️'
    };

    const TITLES = {
        success: 'Success',
        error:   'Error',
        warning: 'Warning',
        info:    'Info'
    };

    const DURATION = {
        success: 3500,
        info:    4000,
        warning: 4500,
        error:   5000
    };

    /**
     * Show a toast notification.
     * @param {string} message  - The text to display
     * @param {'success'|'error'|'warning'|'info'} type
     * @param {string|null} title - Optional custom title
     */
    window.showPopup = function (message, type, title) {
        type  = type  || 'success';
        title = title || TITLES[type] || 'Notice';

        const duration = DURATION[type] || 4000;
        const container = getContainer();

        const toast = document.createElement('div');
        toast.className = 'popup-toast ' + type;
        toast.innerHTML = `
            <span class="popup-icon">${ICONS[type] || 'ℹ️'}</span>
            <div class="popup-body">
                <div class="popup-title">${title}</div>
                <div class="popup-msg">${message}</div>
            </div>
            <button class="popup-close" title="Dismiss">&times;</button>
            <div class="popup-progress" style="animation-duration: ${duration}ms;"></div>
        `;

        container.appendChild(toast);

        // Trigger enter animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });

        function dismiss() {
            toast.classList.remove('show');
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }

        // Auto-dismiss after duration
        const timer = setTimeout(dismiss, duration);

        // Close button
        toast.querySelector('.popup-close').addEventListener('click', function () {
            clearTimeout(timer);
            dismiss();
        });

        // Click anywhere on toast to dismiss early
        toast.addEventListener('click', function (e) {
            if (!e.target.classList.contains('popup-close')) {
                clearTimeout(timer);
                dismiss();
            }
        });
    };

    // Optionally override native alert globally (safe — keeps confirm/prompt intact)
    window._nativeAlert = window.alert;
    window.alert = function (msg) {
        if (document.body) {
            showPopup(String(msg), 'info');
        } else {
            // Fallback before DOM is ready
            document.addEventListener('DOMContentLoaded', function () {
                showPopup(String(msg), 'info');
            });
        }
    };
})();
