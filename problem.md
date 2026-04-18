# Grievance Dashboard - Project Status & Issues Log

This document catalogs the current capabilities of the platform, alongside known bugs, technical debt, and areas requiring future enhancement following the migration from static `localStorage` to a dynamic NodeJS/MongoDB stack.

## 1. Current Features

* **Persistent Database Routing:** Integrated an Express.js server wired to MongoDB locally (Mongoose modeling).
* **Citizen Complaint Cycle:** Citizens can raise issues, assign types, give descriptions, and upload files using `multer`. Live entries persist to MongoDB.
* **Live Status Tracking:** Citizens can retrieve explicit, up-to-date processing statuses via specific backend REST queries referencing their Custom IDs.
* **Real-time Admin Dispatch:** All Admin pages interact with real backend REST logic. Data injects natively via `dynamicAdmin.js`.
* **Socket.IO Emits:** Admin and citizen dashboards auto-refresh organically. When an official updates a case, or an end-user creates one, WebSocket emits ping all viewports mitigating the need for manual browser refreshes.

## 2. Active Bugs & UX Flow Issues

* **Search and Filter Detachment in Admin Dashboard:**
  * *Issue:* Because `dynamicAdmin.js` rewrites the HTML DOM content dynamically replacing `<tbody>` rows internally, the older `keyup` and `change` listeners mapped to the static HTML rows often fail to recognize new real-time content appended after page load.
* **Citizen History Desync:**
  * *Issue:* The Citizen dashboard partially relies on a local array `complaintHistory` inside `localStorage` for displaying the historical table. While real-time data explicitly fetches active targets, historic lists may break state if logged in from a different browser or cleared cache.
* **File Upload Validation:**
  * *Issue:* Currently, `multer` happily accepts any file type and size. There is no hard limit, which may clutter disk space fast.

## 3. Structural Concerns & Technical Debt

* **Dummy Authentication:**
  * The "login" buttons simply redirect between citizen and admin states. There is no true JWT (JSON Web Token), bcrypt salt, or authenticated session middleware locking down the portal. Currently, anyone can fetch `/api/complaints`.
* **Repeated Code Components:**
  * The raw HTML structure duplicates identical top-bars and sidebars across 10+ `.html` files. A template engine (like EJS, Pug) or shifting to a frontend framework (React.js/Next.js) would significantly decrease code size and bug surfaces.
* **Action Button Stubs:**
  * The core DOM action buttons for Admins (`Assign`, `Escalate`, etc) exist in HTML/Vanilla JS but are currently unmapped to explicit `PUT /api/complaints/:id/status` REST methods functionally.

## 4. Suggested Upgrades Roadmap

1. **Phase 1 (Fixing UI Data):** Rewrite `Frontend/src/department/main.js` input listeners using JavaScript event delegation so dynamically injected rows trigger filter queries properly.
2. **Phase 2 (Action Resolvers):** Connect the "View/Assign" buttons securely to a frontend modal that fires `fetch('/api/complaints/ID/status', {method: 'PUT'})` to shift states dynamically from `New` -> `Assigned`.
