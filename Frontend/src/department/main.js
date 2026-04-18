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
    
    console.log(`ACTION: Triggering backend state update for ID ${complaintId}`);

    const currentPath = window.location.pathname.split('/').pop();
    let newStatus = '';
    
    // Simplistic escalation workflow depending on the page we are rendering
    if (currentPath === 'NewComplaints.html') {
         newStatus = 'In Progress';
    } else if (currentPath === 'AssignedComplaints.html') {
         newStatus = 'Resolved';
    } else if (currentPath === 'PendingComplaints.html') {
         newStatus = 'Resolved';
    } else if (currentPath === 'ResolvedComplaints.html') {
         newStatus = 'Resolved'; // Already resolved
    } else {
         newStatus = 'Escalated';
    }

    if(newStatus && newStatus !== 'Resolved' || confirm(`Do you want to step this complaint to ${newStatus}?`)) {
       fetch(`/api/complaints/${complaintId}/status`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status: newStatus })
       }).then(res => res.json())
         .then(data => alert(`Status updated to ${data.status}!`))
         .catch(err => alert('Failed to update status.'));
    }
}


// ====================================================================
//                     MAIN DOM LOAD LISTENER
// ====================================================================
document.addEventListener('DOMContentLoaded', function() {
    
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
        initializeDashboardCharts();
    } 
    if (currentPath.includes('AnalyticsReports.html')) {
        initializeAnalyticsCharts();
    }
    
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