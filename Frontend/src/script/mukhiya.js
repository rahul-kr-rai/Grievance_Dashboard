// --- MUKHIYA DASHBOARD LOGIC - WITH ASYNC/MONGODB SUPPORT ---

let currentComplaintId = null;
let cachedComplaints = [];

function getApiBase() {
    return `${window.location.origin}/api`;
}

function waitForDbReady() {
    if (window.dbReady && typeof getChatParticipants === 'function' && typeof updateComplaint === 'function') return Promise.resolve();
    return new Promise(resolve => {
        window.addEventListener('dbReady', resolve, { once: true });
        setTimeout(resolve, 3000);
    });
}

// Load complaints from API and cache locally
async function loadComplaintsCache() {
    try {
        const response = await fetch(`${getApiBase()}/complaints`);
        const data = await response.json();
        if (data.success) {
            cachedComplaints = data.complaints || [];
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
    }
    return cachedComplaints;
}

window.openModal = async function (id) {
    currentComplaintId = id;
    document.getElementById('actionModal').style.display = "block";
    document.getElementById('resolveForm').style.display = "none";
    document.getElementById('forwardForm').style.display = "none";

    // Load fresh data if not cached
    if (cachedComplaints.length === 0) {
        await loadComplaintsCache();
    }

    const complaint = cachedComplaints.find(c => c.id === id);
    const preview = document.getElementById('complaintPreview');
    if (complaint && preview) {
        preview.innerHTML = `
            <p style="margin-bottom:5px;"><strong>Complaint ID:</strong> ${complaint.id}</p>
            <p style="margin-bottom:5px;"><strong>Citizen Name:</strong> ${complaint.citizenName}</p>
            <p style="margin-bottom:5px;"><strong>Category:</strong> ${complaint.type}</p>
            <p style="margin-bottom:5px;"><strong>Message:</strong> ${complaint.message}</p>
            ${complaint.attachmentName && complaint.attachmentName !== 'None' ? `<p style="margin-top:5px;"><strong>Attachment:</strong> <a href="${complaint.attachmentPath}" target="_blank">${complaint.attachmentName}</a></p>` : ''}
        `;
    }
};

window.closeModal = function () {
    document.getElementById('actionModal').style.display = "none";
};

window.showResolveForm = function () {
    document.getElementById('resolveForm').style.display = "block";
    document.getElementById('forwardForm').style.display = "none";
};

window.showForwardForm = function () {
    document.getElementById('forwardForm').style.display = "block";
    document.getElementById('resolveForm').style.display = "none";
};

window.submitAction = async function (actionType) {
    if (!currentComplaintId) return;

    try {
        await waitForDbReady();
        const complaint = cachedComplaints.find(c => c.id === currentComplaintId);
        if (!complaint) return;

        const updates = {};

        if (actionType === 'resolve') {
            updates.status = 'Resolved';
            updates.dateResolved = new Date().toLocaleDateString('en-GB');
            updates.resolutionRemarks = document.getElementById('mukhiyaResolveRemarks') ? document.getElementById('mukhiyaResolveRemarks').value : "Resolved by Mukhiya.";
        } else if (actionType === 'forward') {
            const reason = document.getElementById('forwardReason') ? document.getElementById('forwardReason').value.trim() : '';
            updates.status = 'Escalated';
            updates.escalationLevel = (complaint.escalationLevel || 0) + 1;
            updates.forwardedBy = 'Mukhiya';
            updates.forwardedDate = new Date().toLocaleDateString('en-GB');
            updates.forwardingRemarks = reason || 'Forwarded to higher authority by Mukhiya.';
            updates.assignedOfficer = 'Admin Department';
        }

        // Update via API
        const success = typeof updateComplaint === 'function'
            ? await updateComplaint(currentComplaintId, updates)
            : false;
        if (success) {
            showPopup('Action submitted successfully! The system has been updated.', 'success');
            await loadComplaintsCache();
            closeModal();
            await renderMukhiyaData();
        } else {
            showPopup('Error submitting action.', 'error');
        }
    } catch (error) {
        console.error('Error submitting action:', error);
        showPopup('An error occurred.', 'error');
    }
};

window.renderMukhiyaData = async function () {
    // Ensure data is loaded
    if (cachedComplaints.length === 0) {
        await loadComplaintsCache();
    }

    const allComplaints = cachedComplaints || [];

    // 1. Update KPIs if they exist on the page
    const totalEl = document.getElementById('kpi-total');
    if (totalEl) {
        const total = allComplaints.length;
        const pending = allComplaints.filter(c => c.status.includes('Progress') || c.status === 'New' || c.status === 'Pending').length;
        const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
        const escalated = allComplaints.filter(c => c.escalationLevel > 0).length;

        totalEl.innerText = total;
        document.getElementById('kpi-pending').innerText = pending;
        document.getElementById('kpi-resolved').innerText = resolved;
        document.getElementById('kpi-escalated').innerText = escalated;
    }

    // 2. Render Table rows
    const tbody = document.getElementById('complaintsTableBody');
    if (tbody) {
        tbody.innerHTML = '';

        const isAll = window.location.pathname.includes('ViewGrievances');
        const toShow = isAll ? allComplaints.slice().reverse() : allComplaints.slice().reverse().slice(0, 10);

        toShow.forEach(c => {
            let statusColor = '#000000'; let statusBg = 'transparent';
            if (c.status.includes('Progress') || c.status === 'Pending' || c.status === 'Waiting for Data') { statusColor = '#856404'; statusBg = '#fff3cd'; }
            else if (c.status === 'Resolved') { statusColor = '#155724'; statusBg = '#d4edda'; }
            else if (c.status === 'Escalated' || c.status === 'Forwarded to Admin' || c.escalationLevel > 0) { statusColor = '#721c24'; statusBg = '#f8d7da'; }
            else if (c.status === 'New') { statusColor = '#004085'; statusBg = '#cce5ff'; }
            else if (c.status === 'Cancelled') { statusColor = '#383d41'; statusBg = '#e2e3e5'; }
            else { statusColor = '#383d41'; statusBg = '#e2e3e5'; }

            const statusLabel = (c.status === 'Forwarded to Admin') ? 'Escalated' : c.status;
            const statusPill = `<span style="padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; background-color: ${statusBg}; color: ${statusColor};">${statusLabel}</span>`;

            let actionBtn;
            if (c.status === 'Resolved' || c.status === 'Cancelled') {
                actionBtn = `<button style="padding: 5px 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: not-allowed;" disabled>Closed</button>`;
            } else if (c.status === 'Escalated' || c.status === 'Forwarded to Admin' || c.escalationLevel > 0) {
                actionBtn = `<button style="padding: 5px 10px; background: #ff9800; color: white; border: none; border-radius: 5px; cursor: not-allowed;" disabled>Escalated</button>`;
            } else {
                actionBtn = `<button onclick="openModal('${c.id}')" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Take Action</button>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.citizenName || 'Unknown'}</td>
                <td>${c.type || 'N/A'}</td>
                <td>${c.dateSubmitted}</td>
                <td>${statusPill}</td>
                <td>${actionBtn}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 3. Setup Direct Connect if on that page
    if (window.location.pathname.includes('DirectConnect')) {
        await renderMukhiyaCitizenList();

        const chatInput = document.getElementById('chatInput');
        if (chatInput && !chatInput.hasAttribute('data-listener-attached')) {
            chatInput.setAttribute('data-listener-attached', 'true');
            chatInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendDirectMessage();
                }
            });
        }

        if (!mukhiyaChatPollInterval) {
            mukhiyaChatPollInterval = setInterval(pollMukhiyaChat, 4000);
        }

        // Initial badge update
        await updateNotifBadge();
    }

    // 4. Setup Announcements
    if (window.location.pathname.includes('MakeAnnouncement')) {
        await renderAnnouncements();
    }

    // 5. Setup Fund Allocations
    if (window.location.pathname.includes('FundAllocation')) {
        await renderFundAllocations();
    }
};

// --- ANNOUNCEMENTS LOGIC ---
window.submitAnnouncement = async function () {
    const title = document.getElementById('announcementTitle').value.trim();
    const body = document.getElementById('announcementBody').value.trim();

    if (!title || !body) {
        showPopup('Please fill out both title and body.', 'warning');
        return;
    }

    try {
        const announcement = await postAnnouncement(title, body);
        if (announcement) {
            document.getElementById('announcementTitle').value = '';
            document.getElementById('announcementBody').value = '';
            showPopup('Announcement broadcasted successfully! 📢', 'success');
            await renderAnnouncements();
        } else {
            showPopup('Error posting announcement.', 'error');
        }
    } catch (error) {
        console.error('Error submitting announcement:', error);
        showPopup('An error occurred while posting announcement.', 'error');
    }
};

window.renderAnnouncements = async function () {
    const list = document.getElementById('announcementList');
    if (!list) return;

    try {
        const announcements = await getAnnouncements();
        if (announcements.length === 0) {
            list.innerHTML = "<p>No recent announcements.</p>";
            return;
        }

        list.innerHTML = announcements.reverse().map(a => `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #00009c;">
                <h4 style="margin: 0 0 5px 0;">${a.title}</h4>
                <small style="color: #666;">${a.date}</small>
                <p style="margin: 10px 0 0 0;">${a.body}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering announcements:', error);
        list.innerHTML = "<p>Error loading announcements.</p>";
    }
};

// --- DIRECT CONNECT LOGIC ---
let activeChatCitizen = null;
let mukhiyaChatPollInterval = null;
let currentMukhiyaMessageCount = 0;

/**
 * Update the header bell badge with the total unread count.
 * Hides the badge when count is 0.
 */
window.updateNotifBadge = async function () {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;

    try {
        const total = typeof getTotalUnreadCount === 'function'
            ? await getTotalUnreadCount('mukhiya', 'Mukhiya')
            : 0;

        if (total > 0) {
            badge.textContent = total > 99 ? '99+' : total;
            badge.classList.remove('hidden');
            // Re-trigger pop animation
            badge.style.animation = 'none';
            badge.offsetHeight; // reflow
            badge.style.animation = 'badgePop 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
        } else {
            badge.classList.add('hidden');
        }
    } catch (err) {
        console.error('[mukhiya] updateNotifBadge error:', err);
    }
};

window.selectCitizenChat = async function (name) {
    activeChatCitizen = name;
    await renderChat();
    // Update badge after reading messages
    await updateNotifBadge();

    if (mukhiyaChatPollInterval) clearInterval(mukhiyaChatPollInterval);
    mukhiyaChatPollInterval = setInterval(pollMukhiyaChat, 4000);
};

window.renderMukhiyaCitizenList = async function () {
    const citizenList = document.getElementById('citizenList');
    if (!citizenList) return;

    try {
        if (cachedComplaints.length === 0) {
            await loadComplaintsCache();
        }

        const allComplaints = cachedComplaints || [];
        const participants = typeof getChatParticipants === 'function' ? await getChatParticipants('mukhiya') : [];
        const uniqueCitizens = [...new Set([...allComplaints.map(c => c.citizenName).filter(Boolean), ...participants])];

        // Fetch per-citizen unread counts in parallel
        const unreadCounts = await Promise.all(
            uniqueCitizens.map(name =>
                typeof getUnreadCount === 'function'
                    ? getUnreadCount('mukhiya', name, 'Mukhiya')
                    : Promise.resolve(0)
            )
        );

        citizenList.innerHTML = uniqueCitizens.map((name, idx) => {
            const isSelected = activeChatCitizen === name;
            const bg = isSelected ? '#ebebeb' : 'transparent';
            const unread = unreadCounts[idx] || 0;
            const badgeHtml = (unread > 0 && !isSelected)
                ? `<span class="citizen-unread-badge">${unread > 99 ? '99+' : unread}</span>`
                : '';

            return `
            <li style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0; cursor:pointer; display: flex; align-items: center; transition: background 0.2s; background: ${bg};" onmouseover="this.style.background='#ebebeb'" onmouseout="if('${name}' !== activeChatCitizen) this.style.background='transparent'" onclick="selectCitizenChat('${name}')">
                <i class="fas fa-user-circle" style="color:#aaa; font-size: 35px; margin-right:15px;"></i>
                <span style="font-size: 16px; font-weight: bold; color: #333; flex:1;">${name}</span>
                ${badgeHtml}
            </li>
        `}).join('');
    } catch (error) {
        console.error('Error rendering citizen list:', error);
        citizenList.innerHTML = '<p>Error loading citizens</p>';
    }
};

window.pollMukhiyaChat = async function () {
    await renderMukhiyaCitizenList();
    await updateNotifBadge();
    if (!activeChatCitizen) return;
    // Auto-refresh chat messages for the open conversation
    const messages = typeof getMessages === 'function'
        ? await getMessages('mukhiya', activeChatCitizen)
        : [];
    if (messages.length !== currentMukhiyaMessageCount) {
        await renderChat();
    }
};

window.sendDirectMessage = async function () {
    if (!activeChatCitizen) {
        showPopup('Please select a citizen to chat with first.', 'warning');
        return;
    }

    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    try {
        const message = await sendMessage('mukhiya', activeChatCitizen, 'Mukhiya', msg);
        if (message) {
            input.value = '';
            await renderChat();
        } else {
            showPopup('Error sending message.', 'error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showPopup('An error occurred while sending message.', 'error');
    }
};

window.renderChat = async function () {
    const chatBox = document.getElementById('chatBox');
    const chatHeaderName = document.getElementById('chatHeaderName');
    if (!chatBox) return;

    if (!activeChatCitizen) {
        chatBox.innerHTML = '<div style="text-align:center; padding: 10px;"><span style="background: #fff; padding: 8px 15px; border-radius: 20px; font-size:13px; color: #555; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">Select a contact from the left menu to start chatting</span></div>';
        if (chatHeaderName) chatHeaderName.innerText = "Select a citizen";
        return;
    }

    if (chatHeaderName) chatHeaderName.innerText = activeChatCitizen;

    try {
        const messages = await getMessages('mukhiya', activeChatCitizen);
        currentMukhiyaMessageCount = messages.length;

        // Mark as read and update badge
        await markMessagesAsRead('mukhiya', activeChatCitizen, 'Mukhiya');
        await updateNotifBadge();

        chatBox.innerHTML = `
            <div style="text-align:center; margin-bottom: 15px;">
                <span style="background: #e9ecef; padding: 5px 12px; border-radius: 15px; font-size: 12px; color: #555;">Today</span>
            </div>
        `;

        messages.forEach(m => {
            const isMukhiya = m.sender === 'Mukhiya';
            const div = document.createElement('div');
            div.style.marginBottom = '10px';
            div.style.textAlign = isMukhiya ? 'right' : 'left';
            div.innerHTML = `
                <div style="display:inline-block; padding: 8px 12px; border-radius: 18px; background: ${isMukhiya ? '#e1ffc7' : '#fff'}; color: #333; max-width: 85%; text-align:left; box-shadow: 0 1px 1px rgba(0,0,0,0.1);">
                    ${m.text}
                    <div style="text-align: right; margin-top: 4px;">
                        <small style="color: #999; font-size: 10px;">${m.time}</small>
                        ${isMukhiya ? '<span style="color: #34b7f1; font-size: 12px; margin-left: 5px;">✓✓</span>' : ''}
                    </div>
                </div>
            `;
            chatBox.appendChild(div);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error rendering chat:', error);
        chatBox.innerHTML = '<p>Error loading messages</p>';
    }
};

// --- FUND ALLOCATIONS ---
window.renderFundAllocations = async function () {
    const tbody = document.getElementById('fundTableBody');
    if (!tbody) return;

    try {
        const funds = await getFundSummary();
        const allocations = await getAllocations();

        const kpiTotal = document.getElementById('kpi-fund-total');
        const kpiAlloc = document.getElementById('kpi-fund-allocated');
        const kpiAvail = document.getElementById('kpi-fund-available');

        if (kpiTotal) kpiTotal.innerText = '₹' + funds.totalBudget.toLocaleString();
        if (kpiAlloc) kpiAlloc.innerText = '₹' + funds.allocated.toLocaleString();
        if (kpiAvail) kpiAvail.innerText = '₹' + funds.available.toLocaleString();

        tbody.innerHTML = allocations.map(a => `
            <tr>
                <td>${a.id}</td>
                <td>${a.projectName}</td>
                <td>${a.category}</td>
                <td>₹${a.amount.toLocaleString()}</td>
                <td>${a.date}</td>
                <td><span style="padding: 3px 8px; border-radius: 12px; background: #d4edda; color: #155724; font-size: 12px;">${a.status}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error rendering fund allocations:', error);
        tbody.innerHTML = '<tr><td colspan="6">Error loading allocations</td></tr>';
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    await waitForDbReady();
    await renderMukhiyaData();
});
