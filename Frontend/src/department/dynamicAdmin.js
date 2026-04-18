// --- Backend Realtime Integration ---
// Add socket.io logic globally
const socket = window.io ? io() : { on: () => {} };

async function fetchDynamicComplaints() {
    try {
        const response = await fetch('/api/complaints');
        const data = await response.json();
        return data;
    } catch (e) {
        console.error("Failed to fetch dynamic complaints", e);
        return [];
    }
}

function renderComplaintTables(complaints) {
    const currentPath = window.location.pathname.split('/').pop();
    const tableBody = document.querySelector('.table-row tbody');
    if(!tableBody) return;

    let filtered = complaints;
    
    // Determine which page we are on and filter
    if(currentPath === 'NewComplaints.html') {
        filtered = complaints.filter(c => c.status === 'New');
    } else if (currentPath === 'AssignedComplaints.html') {
        filtered = complaints.filter(c => (c.status.includes('In Progress') || c.status === 'Waiting for Data') && c.assignedOfficer);
    } else if (currentPath === 'PendingComplaints.html') {
        filtered = complaints.filter(c => (c.status.includes('In Progress') || c.status === 'Waiting for Data') && c.assignedOfficer);
    } else if (currentPath === 'ResolvedComplaints.html') {
        filtered = complaints.filter(c => c.status === 'Resolved');
    } else if (currentPath === 'EscalatedComplaints.html') {
        filtered = complaints.filter(c => c.escalationLevel > 0);
    } // TotalComplaints gets all

    tableBody.innerHTML = '';
    
    filtered.forEach(c => {
        const tr = document.createElement('tr');
        
        // Add checkbox if needed by the view
        let checkboxHtml = tableBody.parentElement.querySelector('thead th input[type="checkbox"]') ? `<td><input type="checkbox"></td>` : '';
        
        let actionBtn = '';
        if(currentPath === 'NewComplaints.html' || currentPath === 'AssignedComplaints.html') {
            actionBtn = `<td><button class="action-btn-view">View/Assign</button></td>`;
        } else if (currentPath === 'ResolvedComplaints.html' || currentPath === 'TotalComplaints.html' || currentPath === 'EscalatedComplaints.html' || currentPath === 'PendingComplaints.html') {
             actionBtn = `<td><button class="action-btn-view">View details</button></td>`;
        } else {
             actionBtn = `<td><button class="action-btn-view">View</button></td>`;
        }

        tr.innerHTML = `
            ${checkboxHtml}
            <td>${c.id}</td>
            <td>${c.citizenName || 'Anonymous'}</td>
            <td>${c.type}</td>
            <td>${c.dateSubmitted}</td>
            <td class="status-${c.status.toLowerCase().split(' ')[0]}">${c.status}</td>
            ${actionBtn}
        `;
        tableBody.appendChild(tr);
    });

    filterTable(); // Re-apply current filters dynamically across injected rows natively
}

let globalComplaints = [];

async function loadDynamicData() {
    const complaints = await fetchDynamicComplaints();
    globalComplaints = complaints;
    renderComplaintTables(complaints);
}

// Search and Filter logic using event delegation mapping
function filterTable() {
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    if (!searchInput && !filterSelect) return;
    
    const searchText = searchInput ? searchInput.value.toLowerCase() : '';
    const filterValue = filterSelect ? filterSelect.value.toLowerCase() : '';

    const tableRows = document.querySelectorAll('.table-row tbody tr');

    tableRows.forEach(row => {
        const idText = row.cells[1] ? row.cells[1].textContent.toLowerCase() : '';
        const nameText = row.cells[2] ? row.cells[2].textContent.toLowerCase() : '';
        const categoryText = row.cells[3] ? row.cells[3].textContent.toLowerCase() : '';
        const statusText = row.cells[4] ? row.cells[4].textContent.toLowerCase() : '';

        const searchMatch = searchText === '' || idText.includes(searchText) || nameText.includes(searchText);
        const filterMatch = filterValue === '' || categoryText.includes(filterValue) || statusText.includes(filterValue);
        
        if (searchMatch && filterMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Socket event listeners
socket.on('newComplaint', (complaint) => {
    console.log("New complaint received real-time!", complaint);
    loadDynamicData();
});

socket.on('complaintUpdated', (complaint) => {
    console.log("Complaint update received real-time!", complaint);
    loadDynamicData();
});

document.addEventListener('DOMContentLoaded', () => {
    loadDynamicData();
    
    // Bind universal table filtering natively mapping any strokes safely to the entire viewport tree
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    
    if (searchInput) searchInput.addEventListener('keyup', filterTable);
    if (filterSelect) filterSelect.addEventListener('change', filterTable);
});
