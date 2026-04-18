# Grievance Dashboard Project Report

## Overview
The **Grievance Dashboard** is a web-based platform designed to bridge the gap between citizens and government departments. It serves as a unified portal for citizens to register public space complaints (e.g., electricity, water supply, road issues) and for administrators to manage, track, and resolve these issues efficiently.

## Architecture & Tech Stack
The project is structurally split into the frontend client and a simulated backend. The application relies primarily on standard web technologies and browser `localStorage` to mock database interactions.
- **Frontend:** HTML, CSS (pure CSS, FontAwesome for icons), Vanilla JavaScript.
- **Backend (Simulated):** A custom JavaScript database layer (`db.js`) managing JSON data via the browser's `localStorage` to simulate a persistent database for demonstrations.

## Directory Structure
```
Grievance_Dashboard/
├── Backend/
│   ├── db.js          # Core database module built over localStorage handling logic (Mock DB, State management)
│   ├── hi.html
│   └── style.css
└── Frontend/
    ├── index.html     # Portal to choose Citizen or Department login
    └── src/
        ├── citizen/   # Citizen-facing module interfaces
        │   ├── Active Complain.html
        │   ├── Complain submitted.html
        │   ├── Dashbord.html
        │   ├── Direct connect.html
        │   ├── GovSchame.html
        │   ├── login.html
        │   ├── Raise New Complaint.html
        │   └── Track complain status.html
        ├── department/ # Department/Admin-facing module interfaces
        │   ├── AdminDashboard.html
        │   ├── AnalyticsReports.html
        │   ├── AssignedComplaints.html
        │   ├── EscalatedComplaints.html
        │   ├── login.html
        │   ├── main.js
        │   ├── NewComplaints.html
        │   ├── PendingComplaints.html
        │   ├── ResolvedComplaints.html
        │   ├── TotalComplaints.html
        │   └── style.css
        ├── script/    # JavaScript logic handling features of citizen dashboard
        │   ├── directConnect.js
        │   ├── govScheme.js
        │   ├── newComplaint.js
        │   └── trackComplaint.js
        ├── css/       # Global CSS stylings
        └── image/     # Icon assets and Images
```

## Key Features

### 1. Citizen Portal
- **Complaint Registration:** Citizens can select the type of problem, write a message, upload evidence, and submit complaints.
- **Complaint Tracking:** Allows citizens to monitor the active status of their logged complaints.
- **Direct Connect:** Connect directly to officers or related contacts.
- **Government Schemes Exploration:** Browse updates on the newest government policies spanning citizens' welfare.

### 2. Department / Admin Portal
- **Dashboard:** Displays centralized real-time views and analytics.
- **Complaint Categorization:** Admin components uniquely resolve state views for incoming tasks. It categorizes grievances into multiple buckets:
  - New Complaints
  - Assigned Complaints
  - Pending Complaints
  - Escalated Complaints
  - Resolved Complaints
- **Progress Oversight:** Evaluates "in progress" statuses, expected resolution times, assignments, and escalation levels.

### 3. Data Flow via `db.js`
- Serves as the central data store logic fetching JSON from `localStorage` under `complaintAdminDB`.
- Defaults to a rich set of pre-seeded sample data on initial load.
- Exposes frontend APIs (e.g., `submitComplaintToDB()`, `getComplaintById()`, and `getComplaintsForAdminView()`) ensuring the UI stays consistent with the data layer without necessitating an absolute running backend server process.

## Conclusion
The Grievance Dashboard demonstrates a scalable template structure to facilitate civil reporting. By splitting concerns gracefully between citizens and staff, accompanied by robust client-side routing and state retention mechanisms without the need to boot up a backend framework during iterations, it achieves high interactivity suitable for a Minimum Viable Product (MVP).
