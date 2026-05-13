// --- MUKHIYA DASHBOARD LOGIC ---

let currentComplaintId = null;

window.openModal = function (id) {
    currentComplaintId = id;
    document.getElementById('actionModal').style.display = "block";
    document.getElementById('resolveForm').style.display = "none";
    document.getElementById('forwardForm').style.display = "none";

    if (typeof SimulatedDB !== 'undefined') {
        const complaint = SimulatedDB.allComplaints.find(c => c.id === id);
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

window.submitAction = function (actionType) {
    if (!currentComplaintId) return;

    if (typeof SimulatedDB !== 'undefined') {
        const complaint = SimulatedDB.allComplaints.find(c => c.id === currentComplaintId);
        if (complaint) {
            if (actionType === 'resolve') {
                complaint.status = 'Resolved';
                complaint.dateResolved = new Date().toLocaleDateString('en-GB');
                complaint.resolutionRemarks = document.getElementById('mukhiyaResolveRemarks') ? document.getElementById('mukhiyaResolveRemarks').value : "Resolved by Mukhiya.";
            } else if (actionType === 'forward') {
                complaint.status = 'Escalated';
                complaint.escalationLevel = (complaint.escalationLevel || 0) + 1;
            }

            if (typeof saveDatabase === 'function') {
                saveDatabase();
            }

            alert("Action submitted successfully! The system has been updated.");
            closeModal();
            renderMukhiyaData();
        }
    }
};

window.renderMukhiyaData = function () {
    if (typeof SimulatedDB === 'undefined') return;
    const allComplaints = SimulatedDB.allComplaints || [];

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
            else if (c.status === 'Escalated') { statusColor = '#721c24'; statusBg = '#f8d7da'; }
            else if (c.status === 'New') { statusColor = '#004085'; statusBg = '#cce5ff'; }
            else if (c.status === 'Cancelled') { statusColor = '#383d41'; statusBg = '#e2e3e5'; }
            else { statusColor = '#383d41'; statusBg = '#e2e3e5'; }

            const statusPill = `<span style="padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; background-color: ${statusBg}; color: ${statusColor};">${c.status}</span>`;

            let actionBtn;
            if (c.status === 'Resolved' || c.status === 'Cancelled') {
                actionBtn = `<button style="padding: 5px 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: not-allowed;" disabled>Closed</button>`;
            } else if (c.status === 'Escalated') {
                actionBtn = `<button style="padding: 5px 10px; background: #ff9800; color: white; border: none; border-radius: 5px; cursor: not-allowed;" disabled>Forwarded</button>`;
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
        renderMukhiyaCitizenList();

        // Add Enter key event listener
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

        // Start a global polling even if no chat is selected (for badges)
        if (!mukhiyaChatPollInterval) {
            mukhiyaChatPollInterval = setInterval(pollMukhiyaChat, 2000);
        }
    }

    // 4. Setup Announcements
    if (window.location.pathname.includes('MakeAnnouncement')) {
        renderAnnouncements();
    }

    // 5. Setup Fund Allocations
    if (window.location.pathname.includes('FundAllocation')) {
        renderFundAllocations();
    }
};

// --- ANNOUNCEMENTS LOGIC ---
window.submitAnnouncement = function () {
    const title = document.getElementById('announcementTitle').value.trim();
    const body = document.getElementById('announcementBody').value.trim();

    if (!title || !body) {
        alert("Please fill out both title and body.");
        return;
    }

    const announcements = JSON.parse(localStorage.getItem('mukhiyaAnnouncements') || '[]');
    announcements.push({
        id: 'ANN' + Date.now(),
        title: title,
        body: body,
        date: new Date().toLocaleDateString('en-GB')
    });
    localStorage.setItem('mukhiyaAnnouncements', JSON.stringify(announcements));

    document.getElementById('announcementTitle').value = '';
    document.getElementById('announcementBody').value = '';

    alert("Announcement broadcasted successfully!");
    renderAnnouncements();
};

window.renderAnnouncements = function () {
    const list = document.getElementById('announcementList');
    if (!list) return;

    const announcements = JSON.parse(localStorage.getItem('mukhiyaAnnouncements') || '[]');
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
};

// --- DIRECT CONNECT LOGIC ---
let activeChatCitizen = null;
let mukhiyaChatPollInterval = null;
let currentMukhiyaMessageCount = 0;

window.selectCitizenChat = function (name) {
    activeChatCitizen = name;
    renderChat();

    if (mukhiyaChatPollInterval) clearInterval(mukhiyaChatPollInterval);
    mukhiyaChatPollInterval = setInterval(pollMukhiyaChat, 2000);
};

window.renderMukhiyaCitizenList = function () {
    const citizenList = document.getElementById('citizenList');
    if (!citizenList) return;

    if (typeof SimulatedDB === 'undefined') return;
    const allComplaints = SimulatedDB.allComplaints || [];

    const chats = JSON.parse(localStorage.getItem('mukhiyaChats') || '{}');
    const chatCitizens = Object.keys(chats);
    const uniqueCitizens = [...new Set([...allComplaints.map(c => c.citizenName).filter(Boolean), ...chatCitizens])];

    citizenList.innerHTML = uniqueCitizens.map(name => {
        const msgs = chats[name] || [];
        const unreadMsgs = msgs.filter(m => m.sender !== 'Mukhiya' && !m.read).length;
        let badgeHtml = unreadMsgs > 0 ? `<span style="background: #28a745; color: white; border-radius: 50%; padding: 2px 8px; font-size: 12px; font-weight: bold; margin-left: auto; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">${unreadMsgs}</span>` : '';

        const isSelected = activeChatCitizen === name;
        const bg = isSelected ? '#ebebeb' : 'transparent';

        return `
        <li style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0; cursor:pointer; display: flex; align-items: center; transition: background 0.2s; background: ${bg};" onmouseover="this.style.background='#ebebeb'" onmouseout="if('${name}' !== activeChatCitizen) this.style.background='transparent'" onclick="selectCitizenChat('${name}')">
            <i class="fas fa-user-circle" style="color:#aaa; font-size: 35px; margin-right:15px;"></i>
            <span style="font-size: 16px; font-weight: bold; color: #333;">${name}</span>
            ${badgeHtml}
        </li>
    `}).join('');
};

window.pollMukhiyaChat = function () {
    renderMukhiyaCitizenList(); // Always update badges

    if (!activeChatCitizen) return;
    let chats = JSON.parse(localStorage.getItem('mukhiyaChats') || '{}');
    let messages = chats[activeChatCitizen] || [];

    let updated = false;

    if (messages.length > currentMukhiyaMessageCount) {
        const chatBox = document.getElementById('chatBox');
        if (!chatBox) return;

        for (let i = currentMukhiyaMessageCount; i < messages.length; i++) {
            const m = messages[i];
            const isMukhiya = m.sender === 'Mukhiya';

            // Mark new incoming as read instantly since we are viewing it
            if (!isMukhiya && !m.read) {
                m.read = true;
                updated = true;
            }

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
        }
        currentMukhiyaMessageCount = messages.length;
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    if (updated) {
        localStorage.setItem('mukhiyaChats', JSON.stringify(chats));
        renderMukhiyaCitizenList(); // update badge again
    }
};

window.sendDirectMessage = function () {
    if (!activeChatCitizen) {
        alert("Please select a citizen to chat with first.");
        return;
    }

    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    const chats = JSON.parse(localStorage.getItem('mukhiyaChats') || '{}');
    if (!chats[activeChatCitizen]) chats[activeChatCitizen] = [];

    chats[activeChatCitizen].push({
        sender: 'Mukhiya',
        text: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    localStorage.setItem('mukhiyaChats', JSON.stringify(chats));
    input.value = '';
    renderChat();
};

window.renderChat = function () {
    const chatBox = document.getElementById('chatBox');
    const chatHeaderName = document.getElementById('chatHeaderName');
    if (!chatBox) return;

    if (!activeChatCitizen) {
        chatBox.innerHTML = '<div style="text-align:center; padding: 10px;"><span style="background: #fff; padding: 8px 15px; border-radius: 20px; font-size:13px; color: #555; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">Select a contact from the left menu to start chatting</span></div>';
        if (chatHeaderName) chatHeaderName.innerText = "Select a citizen";
        return;
    }

    if (chatHeaderName) chatHeaderName.innerText = activeChatCitizen;

    let chats = JSON.parse(localStorage.getItem('mukhiyaChats') || '{}');
    let messages = chats[activeChatCitizen] || [];

    let updated = false;
    messages.forEach(m => {
        if (m.sender !== 'Mukhiya' && !m.read) {
            m.read = true;
            updated = true;
        }
    });
    if (updated) {
        localStorage.setItem('mukhiyaChats', JSON.stringify(chats));
        renderMukhiyaCitizenList();
    }

    currentMukhiyaMessageCount = messages.length;

    chatBox.innerHTML = `
        <div style="text-align:center; margin-bottom: 15px;">
            <span style="background: #e9ecef; padding: 5px 12px; border-radius: 15px; font-size: 12px; color: #555;">Today</span>
        </div>
    `;

    if (messages.length === 0) {
        chatBox.innerHTML += `<div style="text-align:center; padding: 10px;"><span style="background: #fff; padding: 8px 15px; border-radius: 20px; font-size:13px; color: #555; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">No messages yet. Send a greeting!</span></div>`;
        return;
    }

    chatBox.innerHTML += messages.map(m => {
        const isMukhiya = m.sender === 'Mukhiya';
        return `
        <div style="margin-bottom: 10px; text-align: ${isMukhiya ? 'right' : 'left'};">
            <div style="display:inline-block; padding: 8px 12px; border-radius: 18px; background: ${isMukhiya ? '#e1ffc7' : '#fff'}; color: #333; max-width: 85%; text-align:left; box-shadow: 0 1px 1px rgba(0,0,0,0.1);">
                ${m.text}
                <div style="text-align: right; margin-top: 4px;">
                    <small style="color: #999; font-size: 10px;">${m.time}</small>
                    ${isMukhiya ? '<span style="color: #34b7f1; font-size: 12px; margin-left: 5px;">✓✓</span>' : ''}
                </div>
            </div>
        </div>
    `}).join('');

    chatBox.scrollTop = chatBox.scrollHeight;
};

// --- FUND ALLOCATION LOGIC ---
window.submitFundAllocation = function () {
    const project = document.getElementById('fundProject').value.trim();
    const category = document.getElementById('fundCategory').value;
    const amount = document.getElementById('fundAmount').value.trim();

    if (!project || !category || !amount) {
        alert("Please fill out all fields.");
        return;
    }

    const allocations = JSON.parse(localStorage.getItem('mukhiyaFunds') || '[]');
    allocations.push({
        project: project,
        category: category,
        amount: parseInt(amount).toLocaleString('en-IN'),
        status: 'Planning'
    });
    localStorage.setItem('mukhiyaFunds', JSON.stringify(allocations));

    document.getElementById('fundProject').value = '';
    document.getElementById('fundAmount').value = '';

    document.getElementById('fundModal').style.display = 'none';

    alert("Fund allocated successfully!");
    renderFundAllocations();
};

window.renderFundAllocations = function () {
    const tbody = document.getElementById('fundTableBody');
    if (!tbody) return;

    const allocations = JSON.parse(localStorage.getItem('mukhiyaFunds') || '[]');

    // Default mock data if empty
    if (allocations.length === 0) {
        allocations.push(
            { project: 'Village Road Repair', category: 'Infrastructure', amount: '5,00,000', status: 'In Progress' },
            { project: 'Water Pump Installation', category: 'Water Supply', amount: '2,50,000', status: 'Completed' },
            { project: 'Primary School Renovation', category: 'Education', amount: '5,00,000', status: 'Planning' }
        );
        localStorage.setItem('mukhiyaFunds', JSON.stringify(allocations));
    }

    tbody.innerHTML = allocations.map(f => {
        let statusColor = '#000000';
        if (f.status === 'Completed') statusColor = '#28a745';
        else if (f.status === 'In Progress') statusColor = '#ffc107';
        else if (f.status === 'Planning') statusColor = '#1a237e';

        return `
        <tr>
            <td style="padding:10px; border-bottom:1px solid #ddd;">${f.project}</td>
            <td style="padding:10px; border-bottom:1px solid #ddd;">${f.category}</td>
            <td style="padding:10px; border-bottom:1px solid #ddd;">₹ ${f.amount}</td>
            <td style="padding:10px; border-bottom:1px solid #ddd; color: ${statusColor}; font-weight:bold;">${f.status}</td>
        </tr>
    `}).join('');
};

document.addEventListener('DOMContentLoaded', () => {
    // Only render if we are on a Mukhiya page
    if (window.location.pathname.includes('/mukhiya/')) {
        renderMukhiyaData();
    }
});
