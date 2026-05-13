// --- 2. TRACK COMPLAINT STATUS LOGIC (Track complain status.html) ---

function cancelComplaint() {
    const confirmCancel = confirm("Are you sure you want to cancel this complaint?");
    if (confirmCancel) {
        const activeComplaintData = localStorage.getItem('activeComplaint');

        if (activeComplaintData) {
            try {
                const complaint = JSON.parse(activeComplaintData);
                // Update it in the master DB
                if (typeof getComplaintById === 'function') {
                    const dbComplaint = getComplaintById(complaint.id);
                    if (dbComplaint) {
                        dbComplaint.status = "Cancelled";
                        if (typeof saveDatabase === 'function') saveDatabase();
                    }
                }

                // Re-sync local storage arrays from DB
                syncUserComplaintsFromDB();

                alert("Complaint has been cancelled successfully and moved to history.");
            } catch (e) {
                console.error("Error parsing active complaint data during cancellation:", e);
                alert("Cancellation failed due to corrupted complaint data.");
            }
        } else {
            alert("No active complaint to cancel.");
        }

        window.location.href = "Active Complain.html?view=history";
    }
}

function updateComplaint() {
    // Check if there is actually a complaint to update before setting the flag
    if (localStorage.getItem('activeComplaint')) {
        localStorage.setItem('updateMode', 'true');
        window.location.href = "Raise New Complaint.html";
    } else {
        alert("You must raise a complaint first before you can update it.");
        window.location.href = "Active Complain.html";
    }
}


// --- Helper: Sync user complaints directly from SimulatedDB ---
function syncUserComplaintsFromDB() {
    const loggedInUser = localStorage.getItem('loggedInCitizenName');
    if (!loggedInUser || typeof SimulatedDB === 'undefined' || !SimulatedDB.allComplaints) return;

    const userComplaints = SimulatedDB.allComplaints.filter(c => c.citizenName === loggedInUser);

    const history = userComplaints.filter(c => c.status === 'Resolved' || c.status === 'Cancelled' || c.status === 'Closed');
    const active = userComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Cancelled' && c.status !== 'Closed');

    localStorage.setItem('complaintHistory', JSON.stringify(history));

    if (active.length > 0) {
        // The dashboard expects a single active complaint, grab the latest
        localStorage.setItem('activeComplaint', JSON.stringify(active[active.length - 1]));
    } else {
        localStorage.removeItem('activeComplaint');
    }
}

// --- 4. DATA FETCHING AND VIEW LOGIC (Active Complain.html & Track complain status.html) ---

function createComplaintCard(complaint, isHistory = false) {
    const statusColor = isHistory ? (complaint.status === 'Cancelled' ? 'red' : 'green') : '#00009c';
    const mainTitle = isHistory ? `History Details (Status: ${complaint.status})` : 'Complaint Details';

    return `
        <h2 style="text-align: center;">${mainTitle}</h2>
        <hr>
        <p style="color: #00009c;"><b>Complained Date:</b> ${complaint.dateSubmitted || complaint.date}</p>
        <hr>
        <p><b>Complaint Type: </b>${complaint.type}</p>
        <p><b>Message:</b> ${complaint.message}</p>
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
    const historyData = JSON.parse(localStorage.getItem('complaintHistory') || '[]');
    const complaint = historyData.find(c => c.id === complaintId);
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

function loadActiveOrHistoryView() {
    // Check if this script should run on the current page
    if (!document.title.includes('User Dashboard')) {
        return;
    }
    const container = document.querySelector('.complaint-Submitted');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const viewMode = urlParams.get('view');
    const toggleContainer = document.querySelector('.view-toggle');

    if (viewMode === 'history') {
        if (toggleContainer) toggleContainer.style.display = 'block';
        syncUserComplaintsFromDB();
        const historyData = JSON.parse(localStorage.getItem('complaintHistory') || '[]');

        container.innerHTML = getHistoryTableHTML(historyData);

    } else {
        if (toggleContainer) toggleContainer.style.display = 'block';
        syncUserComplaintsFromDB();
        const activeComplaintData = localStorage.getItem('activeComplaint');

        if (activeComplaintData) {
            const complaint = JSON.parse(activeComplaintData);
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


function fetchTrackStatus() {
    syncUserComplaintsFromDB();
    const activeComplaintData = localStorage.getItem('activeComplaint');

    // Check if this script should run on the current page
    if (document.title.includes('Complaint Status')) {
        const container = document.querySelector('.complaint-Submitted');
        if (!container) return;

        if (activeComplaintData) {
            const complaint = JSON.parse(activeComplaintData);

            container.innerHTML = `
                <center><i class="fas fa-cogs" style="color: rgb(0, 183, 255); font-size: 500%;"></i></center>
                <br>
                <center>
                    <h2 style="text-align: center; color: #f00;">Your complaint is ${complaint.status}</h2>
                    <p><b>Your Complaint ID:</b> ${complaint.id}</p>
                    <p><b>Expected Response:</b> ${complaint.expectedResponse || '14 Days'}</p>
                    <br><br>
                    <a href="#" class="Cbtn" onclick="cancelComplaint()">Cancel</a>
                    <a href="#" class="Ubtn" onclick="updateComplaint()">Update</a>
                    <br>
                </center>
                <br><br>
            `;
        } else if (localStorage.getItem('complaintHistory') && JSON.parse(localStorage.getItem('complaintHistory')).length > 0) {
            const history = JSON.parse(localStorage.getItem('complaintHistory'));
            const latest = history[history.length - 1];

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


// --- 5. FEEDBACK SUBMISSION LOGIC ---
window.submitCitizenFeedback = function (id) {
    const rating = document.getElementById('complaintRating').value;
    const feedback = document.getElementById('complaintFeedback').value.trim();

    if (!feedback) {
        alert("Please enter some feedback before submitting.");
        return;
    }

    if (typeof SimulatedDB !== 'undefined' && SimulatedDB.allComplaints) {
        const dbComplaint = SimulatedDB.allComplaints.find(c => c.id === id);
        if (dbComplaint) {
            dbComplaint.citizenRating = parseInt(rating);
            dbComplaint.citizenFeedback = feedback;

            if (typeof saveDatabase === 'function') {
                saveDatabase();
            }

            // Re-sync local storage so UI updates instantly
            syncUserComplaintsFromDB();

            alert("Thank you! Your feedback has been submitted successfully.");

            // Refresh view
            fetchTrackStatus();
        }
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadActiveOrHistoryView();
    fetchTrackStatus();
});