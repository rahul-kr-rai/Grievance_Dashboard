// ====================================================================
//                       CHART DEFINITIONS (Async Version)
// ====================================================================

let cachedAdminComplaints = [];

function getApiBase() {
    return `${window.location.origin}/api`;
}

function waitForDbReady() {
    if (window.dbReady) return Promise.resolve();
    return new Promise(resolve => {
        window.addEventListener('dbReady', resolve, { once: true });
        setTimeout(resolve, 3000);
    });
}

async function loadAdminComplaints() {
    try {
        const response = await fetch(`${getApiBase()}/complaints`);
        const data = await response.json();
        if (data.success) {
            cachedAdminComplaints = data.complaints || [];
        }
    } catch (error) {
        console.error('Error loading complaints for admin:', error);
    }
    return cachedAdminComplaints;
}

function isEscalatedComplaint(c) {
    return (c.escalationLevel || 0) > 0 || c.status === 'Escalated' || c.status === 'Forwarded to Admin';
}

function isClosedComplaint(c) {
    return c.status === 'Resolved' || c.status === 'Closed' || c.status === 'Cancelled';
}

function statusPill(status) {
    var bg = '#e2e3e5';
    var color = '#383d41';
    if (status === 'New') { bg = '#cce5ff'; color = '#004085'; }
    else if (status === 'Resolved' || status === 'Closed') { bg = '#d4edda'; color = '#155724'; }
    else if (status === 'Escalated' || status === 'Forwarded to Admin') { bg = '#f8d7da'; color = '#721c24'; }
    else if (status && status.indexOf('Progress') !== -1) { bg = '#fff3cd'; color = '#856404'; }
    var label = (status === 'Forwarded to Admin') ? 'Escalated' : (status || 'New');
    return `<span style="padding:4px 9px; border-radius:12px; font-size:12px; font-weight:bold; background:${bg}; color:${color};">${label}</span>`;
}

function parseDateString(d) {
    if (!d) return null;
    var p = d.split('/');
    return p.length === 3 ? new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10)) : null;
}

function daysOpen(c) {
    var start = parseDateString(c.dateSubmitted);
    if (!start) return '-';
    return Math.max(0, Math.floor((new Date() - start) / 86400000));
}

function actionButton(c) {
    const id = (c.id || '').toString().replace(/'/g, '&apos;');
    return `<button style="padding:6px 14px; border:0; border-radius:5px; background:#0d6efd; color:#fff; cursor:pointer; font-weight:600; font-size:13px; transition:background 0.2s;" onmouseover="this.style.background='#0b5ed7'" onmouseout="this.style.background='#0d6efd'" onclick="openComplaintModal('${id}')"><i class='fas fa-eye' style='margin-right:5px;'></i>View</button>`;
}

// ---- COMPLAINT DETAILS MODAL ----

function injectComplaintModal() {
    if (document.getElementById('adminComplaintModal')) return;
    const modal = document.createElement('div');
    modal.id = 'adminComplaintModal';
    modal.innerHTML = `
    <div id="adminComplaintModalOverlay" onclick="closeComplaintModal()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:3000;transition:opacity 0.2s;"></div>
    <div id="adminComplaintModalBox" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.95);z-index:3001;background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.25);width:min(94vw,950px);max-height:90vh;overflow-y:auto;font-family:Arial,sans-serif;transition:transform 0.2s,opacity 0.2s;opacity:0;">

        <!-- Header -->
        <div style="padding:22px 28px 16px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;justify-content:space-between;">
            <h2 style="margin:0;color:#1a237e;font-size:1.35rem;display:flex;align-items:center;gap:10px;">
                <i class="fas fa-file-alt" style="color:#1a237e;"></i>
                Complaint Details
            </h2>
            <span onclick="closeComplaintModal()" style="cursor:pointer;font-size:22px;color:#999;line-height:1;transition:color 0.2s;" onmouseover="this.style.color='#333'" onmouseout="this.style.color='#999'">&times;</span>
        </div>

        <!-- Body -->
        <div style="padding:24px 28px;">

            <!-- Two-column info grid -->
            <div id="adminModalInfoGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px 30px;margin-bottom:20px;"></div>

            <hr style="border:none;border-top:1px solid #e9ecef;margin:20px 0;">

            <!-- Message block -->
            <div id="adminModalMessage" style="background:#f8f9fa;border-left:4px solid #1a237e;border-radius:0 6px 6px 0;padding:16px 18px;margin-bottom:24px;">
                <strong style="display:block;margin-bottom:6px;">Message/Description:</strong>
                <span id="adminModalMessageText" style="color:#555;">-</span>
            </div>

            <!-- Resolve section (hidden for resolved/closed) -->
            <div id="adminModalResolveSection">
                <h3 style="color:#28a745;font-size:1rem;margin:0 0 12px;display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-check-circle"></i>
                    Resolve &amp; Close Complaint
                </h3>
                <textarea id="adminModalRemarks" placeholder="Enter remarks or resolution details..." rows="4"
                    style="width:100%;padding:12px;border:1px solid #ced4da;border-radius:6px;font-size:14px;resize:vertical;box-sizing:border-box;outline:none;transition:border 0.2s;"
                    onfocus="this.style.border='1px solid #0d6efd'" onblur="this.style.border='1px solid #ced4da'"></textarea>
                <button onclick="resolveComplaintFromModal()" id="adminModalResolveBtn"
                    style="margin-top:14px;background:#28a745;color:#fff;border:none;border-radius:6px;padding:12px 28px;font-size:15px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background 0.2s;"
                    onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">
                    <i class="fas fa-check-circle"></i> Mark as Resolved
                </button>
            </div>
        </div>
    </div>`;
    document.body.appendChild(modal);
}

let _activeModalComplaintId = null;

window.openComplaintModal = function(id) {
    const c = cachedAdminComplaints.find(x => String(x.id) === String(id));
    if (!c) { console.warn('Complaint not found:', id); return; }
    _activeModalComplaintId = id;

    // Build info grid rows
    const isClosed = isClosedComplaint(c);
    const statusColor = (c.status === 'Resolved' || c.status === 'Closed') ? '#28a745'
        : (c.status === 'In Progress' || (c.status && c.status.includes('Progress'))) ? '#0d6efd'
        : (c.status === 'Escalated' || c.status === 'Forwarded to Admin') ? '#dc3545' : '#856404';

    const fields = [
        ['Complaint ID', `#${c.id}`],
        ['Status', `<strong style="color:${statusColor};">${c.status || 'New'}</strong>`],
        ['Citizen Name', c.citizenName || 'Unknown'],
        ['Date Submitted', c.dateSubmitted || '-'],
        ['Category', c.type || 'N/A'],
        ['Assigned Officer', c.assignedOfficer || '-'],
    ];
    if (c.dateResolved) fields.push(['Date Resolved', c.dateResolved], ['', '']);
    if (c.forwardingRemarks) fields.push(['Forwarding Remarks', c.forwardingRemarks], ['', '']);

    document.getElementById('adminModalInfoGrid').innerHTML = fields.map(([label, value]) =>
        label ? `<div><strong style="color:#333;">${label}:</strong> <span style="color:#555;">${value}</span></div>` : '<div></div>'
    ).join('');

    document.getElementById('adminModalMessageText').textContent = c.message || c.description || '-';
    document.getElementById('adminModalRemarks').value = c.resolutionRemarks || c.forwardingRemarks || '';

    // Show/hide resolve section
    const resolveSection = document.getElementById('adminModalResolveSection');
    resolveSection.style.display = isClosed ? 'none' : 'block';

    // Animate in
    const overlay = document.getElementById('adminComplaintModalOverlay');
    const box     = document.getElementById('adminComplaintModalBox');
    overlay.style.display = 'block';
    box.style.display     = 'block';
    requestAnimationFrame(() => {
        box.style.transform = 'translate(-50%,-50%) scale(1)';
        box.style.opacity   = '1';
    });
    document.body.style.overflow = 'hidden';
};

window.closeComplaintModal = function() {
    const overlay = document.getElementById('adminComplaintModalOverlay');
    const box     = document.getElementById('adminComplaintModalBox');
    if (!overlay) return;
    box.style.transform = 'translate(-50%,-50%) scale(0.95)';
    box.style.opacity   = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
        box.style.display     = 'none';
    }, 180);
    document.body.style.overflow = '';
};

window.resolveComplaintFromModal = async function() {
    if (!_activeModalComplaintId) return;
    const remarks = document.getElementById('adminModalRemarks').value.trim() || 'Resolved by Admin.';
    const btn = document.getElementById('adminModalResolveBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resolving...';

    try {
        const response = await fetch(`${getApiBase()}/complaints/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: _activeModalComplaintId,
                updates: {
                    status: 'Resolved',
                    dateResolved: new Date().toLocaleDateString('en-GB'),
                    resolutionRemarks: remarks
                }
            })
        });
        const data = await response.json();
        if (data.success) {
            closeComplaintModal();
            cachedAdminComplaints = [];
            await renderAdminDashboardData();
            if (typeof showPopup === 'function') showPopup('Complaint marked as Resolved successfully!', 'success');
        } else {
            if (typeof showPopup === 'function') showPopup('Error resolving complaint.', 'error');
        }
    } catch (err) {
        console.error('Error resolving:', err);
        if (typeof showPopup === 'function') showPopup('Network error while resolving.', 'error');
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Mark as Resolved';
};

function getAdminPageMode() {
    var path = window.location.pathname;
    if (path.includes('NewComplaints')) return 'New';
    if (path.includes('EscalatedComplaints')) return 'Escalated';
    if (path.includes('AssignedComplaints')) return 'Assigned';
    if (path.includes('PendingComplaints')) return 'Pending';
    if (path.includes('ResolvedComplaints')) return 'Resolved';
    if (path.includes('TotalComplaints')) return 'All';
    if (path.includes('AdminDashboard')) return 'Dashboard';
    return null;
}

function filterComplaintsForMode(allComplaints, mode) {
    if (mode === 'New') return allComplaints.filter(c => c.status === 'New');
    if (mode === 'Escalated') return allComplaints.filter(isEscalatedComplaint);
    if (mode === 'Assigned') return allComplaints.filter(c => c.assignedOfficer && !isClosedComplaint(c));
    if (mode === 'Pending') return allComplaints.filter(c => !isClosedComplaint(c) && !isEscalatedComplaint(c));
    if (mode === 'Resolved') return allComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed');
    return allComplaints;
}

function rowForMode(c, mode) {
    if (mode === 'New') {
        return `<tr><td><input type="checkbox"></td><td>${c.id}</td><td>${c.citizenName || 'Unknown'}</td><td>${c.type || 'N/A'}</td><td>${c.dateSubmitted || '-'}</td><td>${statusPill(c.status)}</td><td>${actionButton(c)}</td></tr>`;
    }
    if (mode === 'Escalated') {
        return `<tr><td>${c.id}</td><td>${c.citizenName || 'Unknown'}</td><td>${c.type || 'N/A'}</td><td>Level ${c.escalationLevel || 1}</td><td>${c.forwardedBy || 'Mukhiya'}</td><td>${daysOpen(c)}</td><td>${actionButton(c)}</td></tr>`;
    }
    if (mode === 'Assigned') {
        return `<tr><td>${c.id}</td><td>${c.citizenName || 'Unknown'}</td><td>${c.assignedOfficer || 'Admin Department'}</td><td>${statusPill(c.status)}</td><td>${c.forwardedDate || c.updatedAt || c.dateSubmitted || '-'}</td><td>${isEscalatedComplaint(c) ? 'High' : 'Normal'}</td><td>${actionButton(c)}</td></tr>`;
    }
    if (mode === 'Pending') {
        return `<tr><td><input type="checkbox"></td><td>${c.id}</td><td>${c.citizenName || 'Unknown'}</td><td>${c.type || 'N/A'}</td><td>${c.assignedOfficer || 'Unassigned'}</td><td>${daysOpen(c)}</td><td>${c.forwardedDate || c.dateSubmitted || '-'}</td><td>${actionButton(c)}</td></tr>`;
    }
    if (mode === 'Resolved') {
        return `<tr><td>${c.id}</td><td>${c.type || 'N/A'}</td><td>${c.dateResolved || c.closedDate || '-'}</td><td>${daysOpen(c)} days</td><td>${c.citizenRating ? c.citizenRating + '/5' : 'Pending'}</td><td>${c.assignedOfficer || c.forwardedBy || 'Mukhiya'}</td><td>${actionButton(c)}</td></tr>`;
    }
    return `<tr><td>${c.id}</td><td>${c.citizenName || 'Unknown'}</td><td>${c.type || 'N/A'}</td><td>${c.dateSubmitted || '-'}</td><td>${statusPill(c.status)}</td><td>${c.assignedOfficer || '-'}</td><td>${actionButton(c)}</td></tr>`;
}

async function renderAdminDashboardData() {
    const allComplaints = await loadAdminComplaints();
    const mode = getAdminPageMode();
    if (!mode) return;

    const totalEl = document.getElementById('kpi-total');
    if (totalEl) {
        totalEl.innerText = allComplaints.length;
        const pendingEl = document.getElementById('kpi-pending');
        const resolvedEl = document.getElementById('kpi-resolved');
        const escalatedEl = document.getElementById('kpi-escalated');
        if (pendingEl) pendingEl.innerText = allComplaints.filter(c => !isClosedComplaint(c)).length;
        if (resolvedEl) resolvedEl.innerText = allComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
        if (escalatedEl) escalatedEl.innerText = allComplaints.filter(isEscalatedComplaint).length;
    }

    const tbody = document.getElementById('complaintsTableBody') || document.querySelector('.table-row tbody');
    if (!tbody) return;

    const rows = filterComplaintsForMode(allComplaints, mode).slice().reverse();
    tbody.innerHTML = rows.length
        ? rows.map(c => rowForMode(c, mode)).join('')
        : `<tr><td colspan="8" style="text-align:center; color:#777; padding:18px;">No complaints found.</td></tr>`;
}

async function initializeDashboardCharts() {
    const allComplaints = await loadAdminComplaints();

    // Build category counts from real data
    const categoryCounts = {};
    allComplaints.forEach(function(c) {
        const cat = c.type || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const catLabels = Object.keys(categoryCounts);
    const catData   = catLabels.map(function(k) { return categoryCounts[k]; });
    const catColors = ['#0d6efd','#20c997','#ffc107','#dc3545','#6c757d','#6610f2','#fd7e14','#17a2b8'];

    // --- Dashboard: Complaint Categories (Doughnut Chart) ---
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        if (catLabels.length === 0) {
            categoryCtx.parentElement.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No complaints yet.</p>';
        } else {
            new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: catLabels,
                    datasets: [{ data: catData, backgroundColor: catColors.slice(0, catLabels.length), hoverOffset: 4 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });
        }
    }

    // Build monthly trend from real data (dateSubmitted is DD/MM/YYYY)
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const filedByMonth    = new Array(12).fill(0);
    const resolvedByMonth = new Array(12).fill(0);
    allComplaints.forEach(function(c) {
        if (c.dateSubmitted) {
            const parts = c.dateSubmitted.split('/');
            const monthIdx = parseInt(parts[1], 10) - 1;
            if (monthIdx >= 0 && monthIdx < 12) {
                filedByMonth[monthIdx]++;
                if (c.status === 'Resolved' || c.status === 'Closed') resolvedByMonth[monthIdx]++;
            }
        }
    });

    // --- Dashboard: Complaints Over Time (Line Chart) ---
    const timeCtx = document.getElementById('timeChart');
    if (timeCtx) {
        new Chart(timeCtx, {
            type: 'line',
            data: {
                labels: monthNames,
                datasets: [{
                    label: 'Complaints Filed',
                    data: filedByMonth,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    fill: false,
                    tension: 0.3
                }, {
                    label: 'Complaints Resolved',
                    data: resolvedByMonth,
                    borderColor: '#20c997',
                    backgroundColor: 'rgba(32, 201, 151, 0.2)',
                    fill: false,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: true, position: 'top' } }
            }
        });
    }
}

async function initializeAnalyticsCharts() {
    const allComplaints = await loadAdminComplaints();
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    function parseDate(d) {
        if (!d) return null;
        var p = d.split('/');
        return p.length === 3 ? new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0])) : null;
    }
    function daysBetween(start, end) {
        var s = parseDate(start), e = end ? parseDate(end) : new Date();
        if (!s || !e) return null;
        return Math.max(0, Math.floor((e - s) / 86400000));
    }

    // --- 1. Resolution Time Distribution (real data) ---
    var resTimeCtx = document.getElementById('resTimeChart');
    if (resTimeCtx) {
        var buckets = [0, 0, 0, 0];
        allComplaints.filter(function(c) { return c.status === 'Resolved' || c.status === 'Closed'; })
            .forEach(function(c) {
                var d = daysBetween(c.dateSubmitted, c.dateResolved);
                if (d === null) return;
                if (d < 5) buckets[0]++;
                else if (d <= 10) buckets[1]++;
                else if (d <= 20) buckets[2]++;
                else buckets[3]++;
            });
        new Chart(resTimeCtx, {
            type: 'bar',
            data: {
                labels: ['< 5 Days', '5-10 Days', '11-20 Days', '> 20 Days'],
                datasets: [{ label: 'Complaints Resolved', data: buckets, backgroundColor: '#0d6efd', borderColor: '#0d6efd', borderWidth: 1 }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: 'No. of Complaints' } } }, plugins: { legend: { display: false } } }
        });
    }

    // --- 2. Officer Performance (real assigned vs resolved per officer) ---
    var performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx) {
        var officerStats = {};
        allComplaints.forEach(function(c) {
            if (!c.assignedOfficer) return;
            if (!officerStats[c.assignedOfficer]) officerStats[c.assignedOfficer] = { total: 0, resolved: 0 };
            officerStats[c.assignedOfficer].total++;
            if (c.status === 'Resolved' || c.status === 'Closed') officerStats[c.assignedOfficer].resolved++;
        });
        var officerNames = Object.keys(officerStats);
        if (officerNames.length === 0) {
            performanceCtx.parentElement.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No officers assigned yet.</p>';
        } else {
            new Chart(performanceCtx, {
                type: 'bar',
                data: {
                    labels: officerNames,
                    datasets: [
                        { label: 'Total Assigned', data: officerNames.map(function(o) { return officerStats[o].total; }), backgroundColor: 'rgba(54,162,235,0.8)' },
                        { label: 'Resolved', data: officerNames.map(function(o) { return officerStats[o].resolved; }), backgroundColor: 'rgba(75,192,192,0.8)' }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { position: 'top' } } }
            });
        }
    }

    // --- 3. Escalation Rate by Category (real data) ---
    var escalationCtx = document.getElementById('escalationChart');
    if (escalationCtx) {
        var escCats = {};
        allComplaints.filter(function(c) { return c.escalationLevel > 0 || c.status === 'Escalated'; })
            .forEach(function(c) { var cat = c.type || 'Other'; escCats[cat] = (escCats[cat] || 0) + 1; });
        var escLabels = Object.keys(escCats);
        if (escLabels.length === 0) {
            escalationCtx.parentElement.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No escalated complaints yet.</p>';
        } else {
            new Chart(escalationCtx, {
                type: 'pie',
                data: { labels: escLabels, datasets: [{ data: escLabels.map(function(k) { return escCats[k]; }), backgroundColor: ['#dc3545','#ffc107','#0d6efd','#6c757d','#20c997','#fd7e14'], hoverOffset: 4 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });
        }
    }

    // --- 4. Unresolved Complaints Trend by month (real data) ---
    var unresolvedCtx = document.getElementById('unresolvedChart');
    if (unresolvedCtx) {
        var pendingByMonth = new Array(12).fill(0);
        allComplaints.filter(function(c) { return c.status !== 'Resolved' && c.status !== 'Closed' && c.status !== 'Cancelled'; })
            .forEach(function(c) {
                if (c.dateSubmitted) {
                    var parts = c.dateSubmitted.split('/');
                    var mi = parseInt(parts[1], 10) - 1;
                    if (mi >= 0 && mi < 12) pendingByMonth[mi]++;
                }
            });
        new Chart(unresolvedCtx, {
            type: 'line',
            data: { labels: monthNames, datasets: [{ label: 'Unresolved', data: pendingByMonth, borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.2)', fill: true, tension: 0.2 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
        });
    }
}

// ====================================================================
//                  INITIALIZATION
// ====================================================================
document.addEventListener('DOMContentLoaded', async function() {
    injectComplaintModal();
    await waitForDbReady();
    await renderAdminDashboardData();
    // Initialize charts based on page
    if (document.getElementById('categoryChart')) {
        await initializeDashboardCharts();
    }
    if (document.getElementById('resTimeChart')) {
        await initializeAnalyticsCharts();
    }
});
