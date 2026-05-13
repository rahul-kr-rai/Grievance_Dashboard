// ====================================================================
//                       CHART DEFINITIONS (Functions first)
// ====================================================================

function initializeDashboardCharts() {
    // --- Dashboard: Complaint Categories (Doughnut Chart) ---
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Water (30%)', 'Roads (29%)', 'Electricity (20%)', 'Corruption', 'Others'],
                datasets: [{
                    data: [30, 29, 20, 10, 11],
                    backgroundColor: [
                        '#0d6efd', '#20c997', '#ffc107', '#dc3545', '#6c757d'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    title: { display: false }
                }
            }
        });
    }

    // --- Dashboard: Complaints Over Time (Line Chart) ---
    const timeCtx = document.getElementById('timeChart');
    if (timeCtx) {
        new Chart(timeCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                    label: 'Complaints Filed',
                    data: [5, 12, 18, 10, 15],
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    fill: false,
                    tension: 0.3
                }, {
                    label: 'Complaints Resolved',
                    data: [2, 4, 6, 15, 25],
                    borderColor: '#20c997',
                    backgroundColor: 'rgba(32, 201, 151, 0.2)',
                    fill: false,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    legend: { display: true, position: 'top' }
                }
            }
        });
    }
}

function initializeAnalyticsCharts() {
    // --- 1. Analytics: Resolution Time Distribution (Bar Chart) ---
    const resTimeCtx = document.getElementById('resTimeChart');
    if (resTimeCtx) {
        new Chart(resTimeCtx, {
            type: 'bar',
            data: {
                labels: ['< 5 Days', '5-10 Days', '11-20 Days', '> 20 Days'],
                datasets: [{
                    label: 'Complaints Resolved',
                    data: [45, 30, 15, 10],
                    backgroundColor: '#0d6efd',
                    borderColor: '#0d6efd',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Number of Complaints' }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // --- 2. Analytics: Officer Performance Ranking (Radar Chart) ---
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'radar',
            data: {
                labels: ['Resolution Rate', 'Avg Time (Days)', 'Escalation Rate', 'Citizen Score', 'Volume Handled'],
                datasets: [{
                    label: 'Officer A',
                    data: [80, 10, 5, 4.5, 90],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                }, {
                    label: 'Officer B',
                    data: [95, 8, 2, 4.8, 75],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: { line: { borderWidth: 3 } },
                scales: {
                    r: {
                        angleLines: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }
            }
        });
    }

    // --- 3. Analytics: Escalation Rate by Category (Pie Chart) ---
    const escalationCtx = document.getElementById('escalationChart');
    if (escalationCtx) {
        new Chart(escalationCtx, {
            type: 'pie',
            data: {
                labels: ['Corruption (35%)', 'Infrastructure (30%)', 'Misconduct (20%)', 'Other (15%)'],
                datasets: [{
                    data: [35, 30, 20, 15],
                    backgroundColor: [
                        '#dc3545', '#ffc107', '#0d6efd', '#6c757d'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    title: { display: false }
                }
            }
        });
    }

    // --- 4. Analytics: Unresolved Complaints Trend (Line Chart) ---
    const unresolvedCtx = document.getElementById('unresolvedChart');
    if (unresolvedCtx) {
        new Chart(unresolvedCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                    label: 'Pending Complaints',
                    data: [20, 25, 35, 30, 40],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                    fill: true,
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}


// ====================================================================
//                  ACTION BUTTON HANDLER FUNCTION
// ====================================================================
function handleTableActions(event) {
    // 1. Check if the clicked element is an action button
    const button = event.target.closest('button[class^="action-btn-"]');
    if (!button) return;

    event.preventDefault();

    // Find the closest table row (<tr>)
    const row = button.closest('tr');
    if (!row) return;

    // Extract Complaint ID
    const complaintIdCellIndex = row.querySelector('input[type="checkbox"]') ? 1 : 0;
    // Check if the cell exists before accessing textContent
    const complaintId = row.cells[complaintIdCellIndex] ? row.cells[complaintIdCellIndex].textContent.trim() : 'N/A';

    const actionType = button.className.replace('action-btn-', '').split(' ')[0];

    console.log(`--- Action Triggered ---`);
    console.log(`Complaint ID: ${complaintId}`);
    console.log(`Action Type: ${actionType}`);

    // --- Implement Specific Action Logic Here (Redirect, Modal, AJAX) ---
    switch (actionType) {
        case 'view':
        case 'update':
        case 'view/assign':
            // Redirect example:
            // window.location.href = `view_complaint_details.html?id=${complaintId}`;
            console.log(`ACTION: Opening detail view for ID ${complaintId}`);
            break;

        case 'escalate':
        case 'critical':
            // Modal example:
            // openEscalationModal(complaintId);
            console.log(`ACTION: Prompting escalation confirmation for ID ${complaintId}`);
            break;

        default:
            console.log(`ACTION: Unhandled action type: ${actionType}`);
            break;
    }
}


window.assignOfficerDropdown = function (id) {
    if (typeof SimulatedDB === 'undefined') return;

    const selectElem = document.getElementById(`assign_select_${id}`);
    if (!selectElem) return;

    const officerName = selectElem.value;
    if (!officerName) {
        alert("Please select an officer from the dropdown.");
        return;
    }

    const complaint = SimulatedDB.allComplaints.find(c => c.id === id);
    if (complaint) {
        complaint.assignedOfficer = officerName;
        if (complaint.status === 'New' || complaint.status === 'Escalated') {
            complaint.status = 'In Progress';
        }

        if (typeof saveDatabase === 'function') {
            saveDatabase();
        }

        // Dynamically update the admin table
        renderAdminDashboardData();
        if (typeof renderAdminListPage === 'function') renderAdminListPage();
    }
};

window.closeAdminComplaint = function (id) {
    if (typeof SimulatedDB === 'undefined') return;

    const remarksElem = document.getElementById(`closeRemarks_${id}`);
    const remarks = remarksElem ? remarksElem.value.trim() : '';

    if (!remarks) {
        alert("Please enter resolution remarks before closing.");
        return;
    }

    const complaint = SimulatedDB.allComplaints.find(c => c.id === id);
    if (complaint) {
        complaint.status = 'Resolved';
        complaint.dateResolved = new Date().toLocaleDateString('en-GB');
        complaint.resolutionRemarks = remarks;

        if (typeof saveDatabase === 'function') {
            saveDatabase();
        }

        document.getElementById('adminViewModal').style.display = 'none';

        renderAdminDashboardData();
        if (typeof renderAdminListPage === 'function') renderAdminListPage();
    }
};

window.viewAdminComplaintDetails = function (id) {
    if (typeof SimulatedDB === 'undefined') return;
    const complaint = SimulatedDB.allComplaints.find(c => c.id === id);
    if (!complaint) return;

    // Check if modal exists, if not create it
    let modal = document.getElementById('adminViewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'adminViewModal';
        modal.style.cssText = "display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5);";

        modal.innerHTML = `
            <div style="background-color: #fefefe; margin: 10% auto; padding: 20px; border: 1px solid #888; width: 50%; border-radius: 10px; font-family: Arial, sans-serif; position: relative; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                <span onclick="document.getElementById('adminViewModal').style.display='none'" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
                <h2 style="color: #00009c; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-top: 0;"><i class="fas fa-file-alt"></i> Complaint Details</h2>
                <div id="adminViewModalContent" style="margin-top: 20px; font-size: 16px; line-height: 1.6;"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on outside click
        window.addEventListener('click', function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    const content = document.getElementById('adminViewModalContent');
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div><strong style="color: #555;">Complaint ID:</strong> ${complaint.id}</div>
            <div><strong style="color: #555;">Status:</strong> <span style="font-weight:bold; color: #00009c;">${complaint.status}</span></div>
            <div><strong style="color: #555;">Citizen Name:</strong> ${complaint.citizenName}</div>
            <div><strong style="color: #555;">Date Submitted:</strong> ${complaint.dateSubmitted}</div>
            <div><strong style="color: #555;">Category:</strong> ${complaint.type}</div>
            <div><strong style="color: #555;">Assigned Officer:</strong> ${complaint.assignedOfficer || 'None'}</div>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #00009c; border-radius: 4px;">
            <strong style="color: #555; display:block; margin-bottom:5px;">Message/Description:</strong>
            ${complaint.message || 'No description provided.'}
        </div>
        ${complaint.attachmentName && complaint.attachmentName !== 'None' ? `
        <div style="margin-top: 15px;">
            <strong style="color: #555;">Attachment:</strong> <a href="${complaint.attachmentPath}" target="_blank" style="color: #007bff; text-decoration: none;">${complaint.attachmentName}</a>
        </div>` : ''}
        
        ${complaint.resolutionRemarks ? `
        <div style="margin-top: 15px; padding: 15px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
            <strong style="color: #155724; display:block; margin-bottom:5px;">Resolution Remarks:</strong>
            <span style="color: #155724;">${complaint.resolutionRemarks}</span>
        </div>` : ''}
        
        ${(complaint.status !== 'Resolved' && complaint.status !== 'Cancelled') ? `
        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
            <h3 style="color: #28a745; margin-top: 0; font-size: 16px;">Resolve & Close Complaint</h3>
            <textarea id="closeRemarks_${complaint.id}" placeholder="Enter remarks or resolution details..." rows="3" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px; resize: vertical;"></textarea>
            <button onclick="closeAdminComplaint('${complaint.id}')" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;"><i class="fas fa-check-circle"></i> Mark as Resolved</button>
        </div>` : ''}
    `;

    modal.style.display = "block";
};

function renderAdminDashboardData() {
    if (typeof SimulatedDB === 'undefined') return;

    const allComplaints = SimulatedDB.allComplaints || [];

    // Update KPIs
    const total = allComplaints.length;
    const pending = allComplaints.filter(c => c.status.includes('Progress') || c.status === 'New' || c.status === 'Pending').length;
    const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
    const escalated = allComplaints.filter(c => c.escalationLevel > 0).length;

    const elTotal = document.getElementById('kpi-total');
    const elPending = document.getElementById('kpi-pending');
    const elResolved = document.getElementById('kpi-resolved');
    const elEscalated = document.getElementById('kpi-escalated');

    if (elTotal) elTotal.innerText = total;
    if (elPending) elPending.innerText = pending;
    if (elResolved) elResolved.innerText = resolved;
    if (elEscalated) elEscalated.innerText = escalated;

    // Update Table
    const tbody = document.getElementById('complaintsTableBody');
    if (tbody) {
        tbody.innerHTML = '';
        const recent = allComplaints.slice().reverse().slice(0, 10);
        recent.forEach(c => {
            let statusColor = '#000000'; let statusBg = 'transparent';
            if (c.status.includes('Progress') || c.status === 'Pending' || c.status === 'Waiting for Data') { statusColor = '#856404'; statusBg = '#fff3cd'; }
            else if (c.status === 'Resolved') { statusColor = '#155724'; statusBg = '#d4edda'; }
            else if (c.status === 'Escalated') { statusColor = '#721c24'; statusBg = '#f8d7da'; }
            else if (c.status === 'New') { statusColor = '#004085'; statusBg = '#cce5ff'; }
            else if (c.status === 'Cancelled') { statusColor = '#383d41'; statusBg = '#e2e3e5'; }
            else { statusColor = '#383d41'; statusBg = '#e2e3e5'; }

            const statusPill = `<span style="padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; background-color: ${statusBg}; color: ${statusColor};">${c.status}</span>`;

            const officers = ['Officer Rajesh', 'Officer Anjali', 'Officer Ramesh', 'Inspector Vivek'];
            const assignDropdown = `
                <select id="assign_select_${c.id}" style="padding: 5px; border-radius: 5px; margin-right: 5px;">
                    <option value="">Select Officer</option>
                    ${officers.map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>
                <button onclick="assignOfficerDropdown('${c.id}')" style="padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Assign</button>
            `;

            const officerDisplay = c.assignedOfficer
                ? c.assignedOfficer
                : (c.status === 'Resolved' || c.status === 'Cancelled')
                    ? '<span style="color:#6c757d;">Closed</span>'
                    : assignDropdown;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.citizenName || 'Unknown'}</td>
                <td>${c.type || 'N/A'}</td>
                <td>${c.dateSubmitted}</td>
                <td>${statusPill}</td>
                <td>${officerDisplay}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

window.renderAdminListPage = function () {
    if (typeof SimulatedDB === 'undefined' || typeof getComplaintsForAdminView === 'undefined') return;
    const currentPath = window.location.pathname.split('/').pop();

    const listPages = [
        'TotalComplaints.html',
        'NewComplaints.html',
        'AssignedComplaints.html',
        'PendingComplaints.html',
        'ResolvedComplaints.html',
        'EscalatedComplaints.html'
    ];

    if (!listPages.includes(currentPath)) return;

    const tbody = document.querySelector('.table-row tbody');
    if (!tbody) return;

    let filterStatus = 'All';
    if (currentPath === 'NewComplaints.html') filterStatus = 'New';
    else if (currentPath === 'AssignedComplaints.html') filterStatus = 'Assigned';
    else if (currentPath === 'PendingComplaints.html') filterStatus = 'Pending';
    else if (currentPath === 'ResolvedComplaints.html') filterStatus = 'Resolved';
    else if (currentPath === 'EscalatedComplaints.html') filterStatus = 'Escalated';

    const complaints = getComplaintsForAdminView(filterStatus);

    tbody.innerHTML = '';

    complaints.reverse().forEach(c => {
        let statusColor = '#000000'; let statusBg = 'transparent';
        if (c.status.includes('Progress') || c.status === 'Pending' || c.status === 'Waiting for Data') { statusColor = '#856404'; statusBg = '#fff3cd'; }
        else if (c.status === 'Resolved') { statusColor = '#155724'; statusBg = '#d4edda'; }
        else if (c.status === 'Escalated') { statusColor = '#721c24'; statusBg = '#f8d7da'; }
        else if (c.status === 'New') { statusColor = '#004085'; statusBg = '#cce5ff'; }
        else if (c.status === 'Cancelled') { statusColor = '#383d41'; statusBg = '#e2e3e5'; }
        else { statusColor = '#383d41'; statusBg = '#e2e3e5'; }

        const statusPill = `<span style="padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; background-color: ${statusBg}; color: ${statusColor};">${c.status}</span>`;

        const officers = ['Officer Rajesh', 'Officer Anjali', 'Officer Ramesh', 'Inspector Vivek'];
        const assignDropdown = `
            <select id="assign_select_${c.id}" style="padding: 5px; border-radius: 5px; margin-right: 5px;">
                <option value="">Select Officer</option>
                ${officers.map(o => `<option value="${o}">${o}</option>`).join('')}
            </select>
            <button onclick="assignOfficerDropdown('${c.id}')" style="padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Assign</button>
        `;

        const officerDisplay = c.assignedOfficer
            ? c.assignedOfficer
            : (c.status === 'Resolved' || c.status === 'Cancelled')
                ? '<span style="color:#6c757d;">Closed</span>'
                : assignDropdown;

        const viewDetailsBtn = `<button onclick="viewAdminComplaintDetails('${c.id}')" style="padding: 5px 10px; background: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer;">View Details</button>`;

        const tr = document.createElement('tr');

        if (currentPath === 'NewComplaints.html') {
            // Checkbox, Complaint ID, Citizen Name, Category, Date Submitted, Status, Action
            tr.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${c.id}</td>
                <td>${c.citizenName || 'Unknown'}</td>
                <td>${c.type || 'N/A'}</td>
                <td>${c.dateSubmitted}</td>
                <td>${statusPill}</td>
                <td>${officerDisplay}</td>
            `;
        } else if (currentPath === 'AssignedComplaints.html') {
            // Complaint ID, Citizen Name, Assigned Officer, Status, Last Update, Priority, Action
            const priority = c.escalationLevel > 0 ? 'High' : 'Medium';
            const priorityColor = priority === 'High' ? '#dc3545' : '#17a2b8';
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.citizenName || 'Unknown'}</td>
                <td>${c.assignedOfficer || 'Unassigned'}</td>
                <td>${statusPill}</td>
                <td>${c.dateSubmitted}</td>
                <td style="font-weight:bold; color:${priorityColor};">${priority}</td>
                <td>${viewDetailsBtn}</td>
            `;
        } else if (currentPath === 'PendingComplaints.html') {
            // Checkbox, Complaint ID, Citizen Name, Category, Assigned Officer, Days Pending, Last Action Date, Action
            tr.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${c.id}</td>
                <td>${c.citizenName || 'Unknown'}</td>
                <td>${c.type || 'N/A'}</td>
                <td>${c.assignedOfficer || 'Unassigned'}</td>
                <td>3 Days</td>
                <td>${c.dateSubmitted}</td>
                <td>${viewDetailsBtn}</td>
            `;
        } else if (currentPath === 'EscalatedComplaints.html') {
            // Complaint ID, Citizen Name, Category, Escalation Level, Raised By, Days Open, Action
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.citizenName || 'Unknown'}</td>
                <td>${c.type || 'N/A'}</td>
                <td style="color:red; font-weight:bold;">Level ${c.escalationLevel || 1}</td>
                <td>Citizen</td>
                <td>5 Days</td>
                <td>${viewDetailsBtn}</td>
            `;
        } else if (currentPath === 'ResolvedComplaints.html') {
            // Complaint ID, Category, Resolution Date, Time to Resolve, Resolution Score, Closed By, Action
            const ratingText = c.citizenRating ? `<span style="color:#28a745; font-weight:bold;">${c.citizenRating}.0 / 5.0</span><br><small style="color:#6c757d;">"${c.citizenFeedback}"</small>` : `<span style="color:#856404; font-size:12px;">Pending Feedback</span>`;
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.type || 'N/A'}</td>
                <td>${c.dateResolved || c.dateSubmitted}</td>
                <td>4 Days</td>
                <td>${ratingText}</td>
                <td>${c.assignedOfficer || 'System'}</td>
                <td>${viewDetailsBtn}</td>
            `;
        } else {
            // TotalComplaints.html: Complaint ID, Citizen Name, Category, Date Received, Status, Assigned Officer, Action
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.citizenName || 'Unknown'}</td>
                <td>${c.type || 'N/A'}</td>
                <td>${c.dateSubmitted}</td>
                <td>${statusPill}</td>
                <td>${c.assignedOfficer || 'Unassigned'}</td>
                <td>${officerDisplay}</td>
            `;
        }

        tbody.appendChild(tr);
    });
}

// ====================================================================
//                     MAIN DOM LOAD LISTENER
// ====================================================================
document.addEventListener('DOMContentLoaded', function () {

    const currentPath = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.links a');

    // --- 1. Sidebar Active Link Management ---
    sidebarLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();

        if (linkPath === currentPath) {
            link.classList.add('active-link');
        } else {
            link.classList.remove('active-link');
        }
    });

    // --- 2. Chart Initialization Calls ---
    if (currentPath.includes('AdminDashboard.html')) {
        renderAdminDashboardData();
        initializeDashboardCharts();
    }
    if (currentPath.includes('AnalyticsReports.html')) {
        initializeAnalyticsCharts();
    }

    // Check if it's a list page and render it dynamically
    renderAdminListPage();

    // --- 3. UNIVERSAL TABLE FILTERING & SEARCH (Omitted for brevity, but stays here) ---
    // ... (All your filtering logic remains here) ...
    const listPages = [
        'TotalComplaints.html',
        'NewComplaints.html',
        'AssignedComplaints.html',
        'PendingComplaints.html',
        'ResolvedComplaints.html',
        'EscalatedComplaints.html'
    ];

    if (listPages.includes(currentPath)) {
        const searchInput = document.querySelector('.search-input');
        const filterSelect = document.querySelector('.filter-select');
        const tableBody = document.querySelector('.table-row tbody');
        const tableRows = tableBody ? tableBody.querySelectorAll('tr') : [];

        function filterTable() {
            // (Filtering logic unchanged)
            const searchText = searchInput ? searchInput.value.toLowerCase() : '';
            const filterValue = filterSelect ? filterSelect.value.toLowerCase() : '';

            tableRows.forEach(row => {
                const idText = row.cells[0] ? row.cells[0].textContent.toLowerCase() : '';
                const nameText = row.cells[1] ? row.cells[1].textContent.toLowerCase() : '';
                const statusText = row.cells[4] ? row.cells[4].textContent.toLowerCase() : '';

                const searchMatch = searchText === '' || idText.includes(searchText) || nameText.includes(searchText) || row.textContent.toLowerCase().includes(searchText);
                const filterMatch = filterValue === '' || statusText.includes(filterValue);

                if (currentPath === 'NewComplaints.html' && filterSelect) {
                    const categoryText = row.cells[3].textContent.toLowerCase();
                    const categoryMatch = filterValue === '' || categoryText.includes(filterValue);
                    if (searchMatch && categoryMatch) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                } else {
                    if (searchMatch && filterMatch) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        }
        if (searchInput) {
            searchInput.addEventListener('keyup', filterTable);
        }
        if (filterSelect) {
            filterSelect.addEventListener('change', filterTable);
        }
        filterTable();
    }

    // --- 4. ATTACH ACTION BUTTON HANDLER ---
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        // Attach the universal handler to the main content container
        mainContent.addEventListener('click', handleTableActions);
    }
});