// --- db.js ---

// ====================================================================
// 1. SIMULATED DATABASE DEFINITION & PERSISTENCE
// ====================================================================

const DB_STORAGE_KEY = 'complaintAdminDB';

// Initial structure and default sample data
let SimulatedDB = {
    // Basic user credentials for login simulation
    users: [
        { id: 'citizen1', email: 'rahul@example.com', password: 'userpass', role: 'citizen', name: 'Rahul' },
        { id: 'admin1', email: 'admin@city.gov', password: 'adminpass', role: 'admin', name: 'Admin OfficerName' }
    ],
    // Array to hold all complaints (The master source of truth)
    allComplaints: [],
    // Tracking the next available sequential ID for new complaints
    nextComplaintId: 12361
};

// --- Sample Data Initialization ---
function initializeSampleData() {
    SimulatedDB.allComplaints = [
        // Complaint used in AdminDashboard.html and TotalComplaints.html
        {
            id: '#12345', citizenName: 'Rajesh Kumar', type: 'Electricity', message: 'Frequent power cuts.', 
            attachmentName: 'None', attachmentPath: '#', dateSubmitted: '24-Sep-2025',
            status: 'In Progress', expectedResponse: '14-Days', assignedOfficer: 'Officer A', dateAssigned: '25-Sep-2025', dateResolved: null, escalationLevel: 0
        },
        // Complaint used in AdminDashboard.html and AssignedComplaints.html
        {
            id: '#12346', citizenName: 'Anita Sharma', type: 'Road Issues', message: 'Pothole on main road.', 
            attachmentName: 'road_pothole.mp4', attachmentPath: '#', dateSubmitted: '25-Sep-2025',
            status: 'In Progress', expectedResponse: '14-Days', assignedOfficer: 'Officer B', dateAssigned: '25-Sep-2025', dateResolved: null, escalationLevel: 0
        },
        // Complaint used in AdminDashboard.html and EscalatedComplaints.html
        {
            id: '#12347', citizenName: 'Sunil Gupta', type: 'Gov.Scheme Benifit', message: 'Misconduct by official.', 
            attachmentName: 'report.pdf', attachmentPath: '#', dateSubmitted: '21-Sep-2025',
            status: 'In Progress', expectedResponse: '14-Days', assignedOfficer: 'Officer C', dateAssigned: '22-Sep-2025', dateResolved: null, escalationLevel: 2
        },
        // New Complaint for NewComplaints.html
        {
            id: '#12348', citizenName: 'Ravi Verma', type: 'Water Supply', message: 'Low pressure this week.', 
            attachmentName: 'None', attachmentPath: '#', dateSubmitted: '17-Nov-2025',
            status: 'New', expectedResponse: '14-Days', assignedOfficer: null, dateAssigned: null, dateResolved: null, escalationLevel: 0
        },
        // Assigned Complaint for AssignedComplaints.html
        {
            id: '#12349', citizenName: 'Preeti Singh', type: 'Road Damage', message: 'Broken pavement near school.', 
            attachmentName: 'photo.jpg', attachmentPath: '#', dateSubmitted: '16-Nov-2025',
            status: 'In Progress', expectedResponse: '14-Days', assignedOfficer: 'Officer B', dateAssigned: '17-Nov-2025', dateResolved: null, escalationLevel: 0
        },
        // Pending Complaint for PendingComplaints.html (stalled)
        {
            id: '#12351', citizenName: 'Karanjeet Kaur', type: 'Roads', message: 'Illegal construction on public land.', 
            attachmentName: 'None', attachmentPath: '#', dateSubmitted: '05-Nov-2025',
            status: 'In Progress', expectedResponse: '14-Days', assignedOfficer: 'Officer B', dateAssigned: '06-Nov-2025', dateResolved: null, escalationLevel: 0
        },
        // Resolved Complaint for ResolvedComplaints.html
        {
            id: '#12355', citizenName: 'Priya Das', type: 'Water Supply', message: 'Leakage fixed.', 
            attachmentName: 'None', attachmentPath: '#', dateSubmitted: '15-Sep-2025',
            status: 'Resolved', expectedResponse: '5 Days', assignedOfficer: 'Officer A', dateAssigned: '15-Sep-2025', dateResolved: '20-Sep-2025', escalationLevel: 0
        },
    ];
}


/**
 * Loads the database state from localStorage on startup. If no data exists, 
 * it initializes with sample data.
 */
function loadDatabase() {
    const storedData = localStorage.getItem(DB_STORAGE_KEY);
    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData);
            SimulatedDB.allComplaints = parsedData.allComplaints || [];
            SimulatedDB.nextComplaintId = parsedData.nextComplaintId || 12361;

            // If loaded complaints array is empty, populate with samples once
            if (SimulatedDB.allComplaints.length === 0) {
                initializeSampleData();
                saveDatabase();
            }
            
        } catch (e) {
            console.error("Failed to load database from localStorage. Starting with samples.", e);
            initializeSampleData();
        }
    } else {
        // First run: Initialize with samples
        initializeSampleData();
    }
}

/**
 * Saves the current state of the database (excluding user list) to localStorage.
 */
function saveDatabase() {
    const dataToStore = {
        allComplaints: SimulatedDB.allComplaints,
        nextComplaintId: SimulatedDB.nextComplaintId
    };
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dataToStore));
}

// ====================================================================
// 2. CITIZEN PORTAL UTILITIES (For integration with newComplaint.js)
// ====================================================================

/**
 * Submits a new complaint or updates an existing one in the master list.
 * @param {Object} newComplaintData - The complaint object from the submission form.
 * @param {boolean} isUpdate - True if updating an existing complaint.
 * @returns {string} The ID of the submitted/updated complaint.
 */
function submitComplaintToDB(newComplaintData, isUpdate) {
    if (!isUpdate) {
        // Create new complaint ID and increment counter
        const newId = '#' + SimulatedDB.nextComplaintId++;
        newComplaintData.id = newId;
        newComplaintData.status = 'New';
        newComplaintData.dateSubmitted = new Date().toLocaleDateString('en-GB');
        
        SimulatedDB.allComplaints.push(newComplaintData);
    } else {
        // Find and update the existing complaint
        const index = SimulatedDB.allComplaints.findIndex(c => c.id === newComplaintData.id);
        if (index !== -1) {
            // Merge existing data to retain admin actions like officer assignment
            const existing = SimulatedDB.allComplaints[index];
            
            SimulatedDB.allComplaints[index] = {
                ...existing, // Keep officer, escalation level, etc.
                type: newComplaintData.type,
                message: newComplaintData.message,
                attachmentName: newComplaintData.attachmentName,
                attachmentPath: newComplaintData.attachmentPath,
                status: 'In Progress (Updated)',
            };
        } else {
            console.error("Attempted to update a complaint not found in the master DB.");
            return null;
        }
    }
    saveDatabase();
    return newComplaintData.id;
}


/**
 * Retrieves a complaint from the master list by ID.
 * @param {string} id - The complaint ID.
 * @returns {Object|undefined} The complaint object.
 */
function getComplaintById(id) {
    return SimulatedDB.allComplaints.find(c => c.id === id);
}

// ====================================================================
// 3. ADMIN PORTAL UTILITIES (For integration with main.js for filtering)
// ====================================================================

/**
 * Retrieves complaints based on the specified status filter for Admin views.
 * @param {string} statusFilter - 'New', 'Resolved', 'Escalated', 'Pending', 'Assigned', or 'All'.
 * @returns {Array} - The filtered list of complaints.
 */
function getComplaintsForAdminView(statusFilter) {
    let complaints = SimulatedDB.allComplaints;

    switch (statusFilter) {
        case 'New':
            return complaints.filter(c => c.status === 'New');
        case 'Resolved':
            return complaints.filter(c => c.status === 'Resolved');
        case 'Escalated':
            return complaints.filter(c => c.escalationLevel > 0);
        case 'Assigned':
            // Complaints that are assigned and not resolved/new
            return complaints.filter(c => 
                (c.status === 'In Progress' || c.status === 'In Progress (Updated)' || c.status === 'Waiting for Data') && c.assignedOfficer
            );
        case 'Pending':
            // Stalled complaints (e.g., in progress for over 7 days, simple example)
            return complaints.filter(c => 
                (c.status === 'In Progress' || c.status === 'In Progress (Updated)' || c.status === 'Waiting for Data') && c.assignedOfficer
            );
        case 'All':
        default:
            return complaints;
    }
}

// ====================================================================
// 4. INITIALIZATION & EXPORT
// ====================================================================

// Load database state when the script loads
loadDatabase();

// Export the necessary objects/functions to the global scope if not using modules
// In a non-module environment, these will be available globally after script execution.
// window.SimulatedDB = SimulatedDB; 
// window.submitComplaintToDB = submitComplaintToDB;
// window.getComplaintsForAdminView = getComplaintsForAdminView;