// --- TRACK COMPLAINT STATUS LOGIC ---

// Local cache of complaints for sync access
let cachedComplaints = [];
let activeComplaint = null;
let complaintHistory = [];

function waitForDbReady() {
    if (window.dbReady && typeof getComplaintsByCitizen === 'function') return Promise.resolve();
    return new Promise(resolve => {
        window.addEventListener('dbReady', resolve, { once: true });
        setTimeout(resolve, 3000);
    });
}

async function syncComplaintsFromDB() {
    try {
        await waitForDbReady();
        const loggedInUser = typeof getLoggedInUser === 'function' ? getLoggedInUser() : window.__authUser;
        if (!loggedInUser || !loggedInUser.name) return [];

        const complaints = await getComplaintsByCitizen(loggedInUser.name);
        cachedComplaints = complaints;

        complaintHistory = complaints.filter(c =>
            c.status === 'Resolved' || c.status === 'Cancelled' || c.status === 'Closed'
        );
        const active = complaints.filter(c =>
            c.status !== 'Resolved' && c.status !== 'Cancelled' && c.status !== 'Closed'
        );
        activeComplaint = active.length > 0 ? active[active.length - 1] : null;

        return complaints;
    } catch (error) {
        console.error('Error syncing complaints:', error);
        return [];
    }
}

async function cancelComplaint() {
    const confirmCancel = confirm("Are you sure you want to cancel this complaint?");
    if (confirmCancel) {
        await syncComplaintsFromDB();

        if (activeComplaint) {
            try {
                if (typeof updateComplaintInDB === 'function') {
                    const success = await updateComplaintInDB(activeComplaint.id, { status: 'Cancelled' });
                    if (success) {
                        await syncComplaintsFromDB();
                        showPopup('Complaint has been cancelled successfully.', 'success');
                        setTimeout(() => {
                            window.location.href = "Active Complain.html?view=history";
                        }, 1000);
                    } else {
                        showPopup('Error cancelling complaint.', 'error');
                    }
                }
            } catch (e) {
                console.error("Error parsing active complaint data during cancellation:", e);
                showPopup('Cancellation failed due to corrupted complaint data.', 'error');
            }
        } else {
            showPopup('No active complaint to cancel.', 'warning');
        }
    }
}

async function updateComplaintHandler() {
    await syncComplaintsFromDB();
    if (activeComplaint) {
        window.location.href = "Raise New Complaint.html?updateId=" + encodeURIComponent(activeComplaint.id);
    } else {
        showPopup('You must raise a complaint first before you can update it.', 'warning');
        window.location.href = "Active Complain.html";
    }
}

// Keep old function name for compatibility
window.updateComplaint = updateComplaintHandler;
window.cancelComplaint = cancelComplaint;

function createComplaintCard(complaint, isHistory = false) {
    const isForwarded = complaint.status === 'Forwarded to Admin' || complaint.status === 'Escalated' || (complaint.escalationLevel || 0) > 0;
    const statusColor = isHistory ? (complaint.status === 'Cancelled' ? 'red' : 'green') : (isForwarded ? '#dc3545' : '#00009c');
    const mainTitle = isHistory ? `History Details (Status: ${complaint.status})` : 'Complaint Details';

    return `
        <h2 style="text-align: center;">${mainTitle}</h2>
        <hr>
        <p style="color: #00009c;"><b>Complained Date:</b> ${complaint.dateSubmitted || complaint.date}</p>
        <hr>
        <p><b>Complaint Type: </b>${complaint.type}</p>
        <p><b>Message:</b> ${complaint.message}</p>
        <p><b>Status:</b> <span style="color:${statusColor}; font-weight:bold;">${complaint.status || 'New'}</span></p>
        ${isForwarded ? `
            <div style="background:#fff3cd; padding:12px; border-radius:5px; margin: 12px 0; border-left: 4px solid #ff9800;">
                <p style="margin:0 0 6px 0;"><b>Forwarded To:</b> Admin Department</p>
                <p style="margin:0 0 6px 0;"><b>Forwarded Date:</b> ${complaint.forwardedDate || 'N/A'}</p>
                <p style="margin:0;"><b>Reason:</b> ${complaint.forwardingRemarks || 'Forwarded to higher authority for action.'}</p>
            </div>
        ` : ''}
        <p><b>Attachment:</b></p>
        <a href="${complaint.attachmentPath}" target="_blank">${complaint.attachmentName}</a>
        <br>
        <p><b>Your Complaint ID:</b> ${complaint.id}</p>
        <p><b>Expected Response:</b> ${complaint.expectedResponse || '14 Days'}</p>
    `;
}

function getHistoryTableHTML(historyData) {
    if (historyData.length === 0) {
        return `<p style="text-align: center; color: red;">Your complaint history is empty.</p>`;
    }

    let tableRows = historyData.reverse().map(complaint => `
        <tr>
            <td>${complaint.id}</td>
            <td>${complaint.type}</td>
            <td>${complaint.dateSubmitted || complaint.date}</td>
            <td style="color: ${complaint.status === 'Cancelled' ? 'red' : 'green'}; font-weight: bold;">${complaint.status}</td>
            <td>
                <button class="view-history-btn" onclick="viewHistoricalComplaintDetails('${complaint.id}')">View</button>
            </td>
        </tr>
    `).join('');

    return `
        <h2 style="text-align: center; margin-bottom: 20px;">Complaint History (${historyData.length} Total)</h2>
        <table class="complaint-history-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

function viewHistoricalComplaintDetails(complaintId) {
    const complaint = complaintHistory.find(c => c.id === complaintId);
    const container = document.querySelector('.complaint-Submitted');
    const toggleContainer = document.querySelector('.view-toggle');

    if (complaint && container) {
        if (toggleContainer) toggleContainer.style.display = 'none';

        container.innerHTML = createComplaintCard(complaint, true) +
            (complaint.resolutionRemarks ? `
            <div style="background:#d4edda; padding:15px; border-radius:5px; margin-top: 15px; border-left: 4px solid #28a745;">
                <p style="margin:0;"><b style="color:#155724;">Resolution Remarks:</b> <span style="color:#155724;">${complaint.resolutionRemarks}</span></p>
            </div>
            ` : '') +
            `<div style="text-align: center; margin-top: 20px;">
                 <a class="Cbtn" style="display: inline-block; background-color: #007bff; cursor: pointer;" href="Active Complain.html?view=history">
                    <i class="fas fa-arrow-left"></i> Back to History
                 </a>
             </div>`;
    }
}

async function loadActiveOrHistoryView() {
    // Check if this script should run on the current page
    if (!document.title.includes('User Dashboard')) {
        return;
    }
    const container = document.querySelector('.complaint-Submitted');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const viewMode = urlParams.get('view');
    const complaintId = urlParams.get('complaintId');
    const toggleContainer = document.querySelector('.view-toggle');

    if (toggleContainer) toggleContainer.style.display = 'block';

    // Sync from API
    await syncComplaintsFromDB();

    if (complaintId && typeof getComplaintById === 'function') {
        const exactComplaint = await getComplaintById(complaintId);
        if (exactComplaint && exactComplaint.id) {
            activeComplaint = exactComplaint;
        }
    }

    const historyData = complaintHistory.slice();

    if (viewMode === 'history') {
        container.innerHTML = getHistoryTableHTML(historyData);
    } else {
        if (activeComplaint) {
            const complaint = activeComplaint;
            container.innerHTML = createComplaintCard(complaint, false);
        } else if (historyData.length > 0) {
            const latest = historyData[historyData.length - 1];
            container.innerHTML = `
                <center><i class="fas fa-clipboard-check" style="color: #28a745; font-size: 400%;"></i></center>
                <br>
                <h2 style="text-align: center; color: #28a745;">Latest Complaint ${latest.status}</h2>
                <div style="text-align: center; font-size: 16px;">
                    <p>Your recent complaint <b>#${latest.id}</b> has been ${latest.status}.</p>
                    ${latest.resolutionRemarks ? `<div style="background:#d4edda; padding:10px; border-radius:5px; margin: 15px auto; max-width: 80%; border-left: 4px solid #28a745;"><p style="margin:0; color:#155724;"><b>Admin Remarks:</b> ${latest.resolutionRemarks}</p></div>` : ''}
                </div>
                <br>
                <div style="text-align: center;">
                    <a href="Active Complain.html?view=history" style="background:#007bff; color:white; padding:10px 20px; border-radius:5px; text-decoration:none; margin-right:10px;"><i class="fas fa-history"></i> View Full History</a>
                </div>
                <br>
            `;
        } else {
            container.innerHTML = `
                <center><i class="fas fa-times-circle" style="color: #ff3232; font-size: 500%;"></i></center>
                <br>
                <h2 style="text-align: center;">No Active Complaints Found</h2>
                <p style="text-align: center;">Please raise a new complaint from the sidebar.</p>
                <br>
            `;
        }
    }
}

async function fetchTrackStatus() {
    // Sync from API
    await syncComplaintsFromDB();

    // Check if this script should run on the current page
    if (document.title.includes('Complaint Status')) {
        const container = document.querySelector('.complaint-Submitted');
        if (!container) return;

        if (activeComplaint) {
            const complaint = activeComplaint;
            const isForwarded = complaint.status === 'Forwarded to Admin' || complaint.status === 'Escalated' || (complaint.escalationLevel || 0) > 0;

            container.innerHTML = `
                <center><i class="fas ${isForwarded ? 'fa-share-square' : 'fa-cogs'}" style="color: ${isForwarded ? '#ff9800' : 'rgb(0, 183, 255)'}; font-size: 500%;"></i></center>
                <br>
                <center>
                    <h2 style="text-align: center; color: #f00;">Your complaint is ${complaint.status}</h2>
                    <p><b>Your Complaint ID:</b> ${complaint.id}</p>
                    <p><b>Expected Response:</b> ${complaint.expectedResponse || '14 Days'}</p>
                    ${isForwarded ? `
                        <div style="background:#fff3cd; padding:12px; border-radius:5px; margin: 15px auto; max-width: 70%; border-left: 4px solid #ff9800; text-align:left;">
                            <p style="margin:0 0 6px 0;"><b>Forwarded To:</b> Admin Department</p>
                            <p style="margin:0 0 6px 0;"><b>Forwarded Date:</b> ${complaint.forwardedDate || 'N/A'}</p>
                            <p style="margin:0;"><b>Reason:</b> ${complaint.forwardingRemarks || 'Forwarded to higher authority for action.'}</p>
                        </div>
                    ` : ''}
                    <br><br>
                    <a href="#" class="Cbtn" onclick="cancelComplaint()">Cancel</a>
                    <a href="#" class="Ubtn" onclick="updateComplaint()">Update</a>
                    <br>
                </center>
                <br><br>
            `;
        } else if (complaintHistory.length > 0) {
            const latest = complaintHistory[complaintHistory.length - 1];

            container.innerHTML = `
                <center><i class="fas fa-check-circle" style="color: #28a745; font-size: 500%;"></i></center>
                <br>
                <center>
                    <h2 style="text-align: center; color: #28a745;">Your recent complaint is ${latest.status}</h2>
                    <p><b>Complaint ID:</b> ${latest.id}</p>
                    <p><b>Category:</b> ${latest.type}</p>
                    ${latest.resolutionRemarks ? `<div style="background:#d4edda; padding:10px; border-radius:5px; margin: 15px auto; max-width: 60%; border-left: 4px solid #28a745;"><p style="margin:0; color:#155724;"><b>Remarks:</b> ${latest.resolutionRemarks}</p></div>` : ''}

                    ${(latest.status === 'Resolved' && !latest.citizenFeedback) ? `
                        <div id="feedback-container" style="margin: 20px auto; padding: 15px; border: 1px solid #ddd; border-radius: 8px; max-width: 60%; background: #f9f9f9;">
                            <h3 style="color:#00009c; font-size:16px; margin-top:0;">Rate Resolution</h3>
                            <select id="complaintRating" style="padding: 8px; border-radius: 5px; margin-bottom: 10px; width: 100%;">
                                <option value="5">⭐⭐⭐⭐⭐ (5/5) - Excellent</option>
                                <option value="4">⭐⭐⭐⭐ (4/5) - Good</option>
                                <option value="3">⭐⭐⭐ (3/5) - Average</option>
                                <option value="2">⭐⭐ (2/5) - Poor</option>
                                <option value="1">⭐ (1/5) - Very Bad</option>
                            </select>
                            <textarea id="complaintFeedback" placeholder="Leave your feedback..." rows="2" style="width: 100%; box-sizing: border-box; padding: 10px; border-radius: 5px; border: 1px solid #ccc; resize: vertical;"></textarea>
                            <button onclick="submitCitizenFeedback('${latest.id}')" style="margin-top: 10px; background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%;"><i class="fas fa-paper-plane"></i> Submit Feedback</button>
                        </div>
                    ` : (latest.citizenFeedback ? `
                        <div style="margin: 15px auto; padding: 10px; border: 1px solid #cce5ff; border-radius: 8px; max-width: 60%; background: #e6f2ff;">
                            <p style="margin: 0; color: #004085;"><b>Your Rating:</b> ${latest.citizenRating} / 5 ⭐</p>
                            <p style="margin: 5px 0 0 0; color: #004085; font-size: 14px;">"${latest.citizenFeedback}"</p>
                        </div>
                    ` : '')}

                    <br>
                    <a href="Active Complain.html?view=history" class="Cbtn" style="background:#007bff; color:white; text-decoration:none; padding:10px 20px; border-radius:5px;">View History</a>
                    <a href="Raise New Complaint.html" class="Ubtn" style="background:#28a745; color:white; text-decoration:none; padding:10px 20px; border-radius:5px;">Raise New</a>
                    <br><br>
                </center>
            `;
        } else {
            container.innerHTML = `
                <center><i class="fas fa-times-circle" style="color: #ff3232; font-size: 500%;"></i></center>
                <br>
                <center>
                    <h2 style="text-align: center; color:#ff3232 ">No Complaints Found</h2>
                    <p>You have no active or past complaints.</p>
                    <br><br>
                    <a href="Raise New Complaint.html" class="Ubtn" style="background:#007bff; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">Raise a Complaint</a>
                    <br><br>
                </center>
            `;
        }
    }
}

window.submitCitizenFeedback = async function (id) {
    const rating = document.getElementById('complaintRating').value;
    const feedback = document.getElementById('complaintFeedback').value.trim();

    if (!feedback) {
        showPopup('Please enter some feedback before submitting.', 'warning');
        return;
    }

    try {
        const success = await updateComplaintInDB(id, {
            citizenRating: parseInt(rating),
            citizenFeedback: feedback
        });

        if (success) {
            await syncComplaintsFromDB();
            showPopup('Thank you! Your feedback has been submitted successfully. ⭐', 'success');
            await fetchTrackStatus();
        } else {
            showPopup('Error submitting feedback. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showPopup('An error occurred while submitting feedback.', 'error');
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadActiveOrHistoryView();
    await fetchTrackStatus();
});
