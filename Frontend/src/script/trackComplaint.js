// --- 2. TRACK COMPLAINT STATUS LOGIC (Track complain status.html) ---

function cancelComplaint() {
    const confirmCancel = confirm("Are you sure you want to cancel this complaint?");
    if (confirmCancel) {
        const activeComplaintData = localStorage.getItem('activeComplaint');
        
        if (activeComplaintData) {
            try {
                const complaint = JSON.parse(activeComplaintData);
                
                let history = JSON.parse(localStorage.getItem('complaintHistory') || '[]');
                complaint.status = "Cancelled";
                history.push(complaint);
                
                localStorage.setItem('complaintHistory', JSON.stringify(history));
                localStorage.removeItem('activeComplaint');
                
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


// --- 4. DATA FETCHING AND VIEW LOGIC (Active Complain.html & Track complain status.html) ---

function createComplaintCard(complaint, isHistory = false) {
    const statusColor = isHistory ? (complaint.status === 'Cancelled' ? 'red' : 'green') : '#00009c';
    const mainTitle = isHistory ? `History Details (Status: ${complaint.status})` : 'Complaint Details';

    return `
        <h2 style="text-align: center;">${mainTitle}</h2>
        <hr>
        <p style="color: #00009c;"><b>Complained Date:</b> ${complaint.date}</p>
        <hr>
        <p><b>Complaint Type: </b>${complaint.type}</p>
        <p><b>Message:</b> ${complaint.message}</p>
        <p><b>Attachment:</b></p>
        <a href="${complaint.attachmentPath}" target="_blank">${complaint.attachmentName}</a>
        <br>
        <p><b>Your Complaint ID:</b> ${complaint.id}</p>
        <p><b>Expected Response:</b> ${complaint.expectedResponse}</p>
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
            <td>${complaint.date}</td>
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
        const historyData = JSON.parse(localStorage.getItem('complaintHistory') || '[]');
        
        container.innerHTML = getHistoryTableHTML(historyData);
        
    } else {
        if (toggleContainer) toggleContainer.style.display = 'block'; 
        const activeComplaintData = localStorage.getItem('activeComplaint');

        if (activeComplaintData) {
            const complaint = JSON.parse(activeComplaintData);
            container.innerHTML = createComplaintCard(complaint, false);
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
                    <p><b>Expected Response:</b> ${complaint.expectedResponse}</p>
                    <br><br>
                    <a href="#" class="Cbtn" onclick="cancelComplaint()">Cancel</a>
                    <a href="#" class="Ubtn" onclick="updateComplaint()">Update</a>
                    <br>
                </center>
                <br><br>
            `;
        } else {
            container.innerHTML = `
                <center><i class="fas fa-times-circle" style="color: #ff3232; font-size: 500%;"></i></center>
                <br>
                <center>
                    <h2 style="text-align: center; color:#ff3232 ">No Active Complaint to Track</h2>
                    <p>Please raise a new complaint first.</p>
                    <br><br>
                    <a href="#" class="Cbtn" onclick="cancelComplaint()">Cancel</a>
                    <a href="#" class="Ubtn" onclick="updateComplaint()">Update</a>
                    <br><br>
                </center>
            `;
        }
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadActiveOrHistoryView();
    fetchTrackStatus(); 
});