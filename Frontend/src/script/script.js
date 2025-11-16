// --- 1. GOVERNMENT SCHEMES LOGIC (GovSchame.html) ---

function toggleDetails(schemeId) {
    const details = document.getElementById(schemeId);
    if (details) {
        details.style.display = (details.style.display === "block") ? "none" : "block";
    }
}

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

// --- 3. COMPLAINT SUBMISSION AND STORAGE LOGIC (Raise New Complaint.html) ---

function saveComplaintData(event) {
    event.preventDefault(); 

    const form = event.target;
    const complaintType = form.elements['complaint'].value;
    const description = form.elements['description'].value;
    const attachmentFile = form.elements['file'].files[0];
    
    const isUpdate = localStorage.getItem('updateMode') === 'true';
    let existingComplaint = {};
    try {
        existingComplaint = JSON.parse(localStorage.getItem('activeComplaint') || '{}');
    } catch (e) {
        console.error("Corrupted active complaint data found, starting fresh.");
    }
    
    const complaintID = isUpdate ? existingComplaint.id : 'RD' + Math.floor(Math.random() * 100000);
    const date = isUpdate ? existingComplaint.date : new Date().toLocaleDateString('en-GB');

    let complaint = {
        id: complaintID,
        date: date,
        type: complaintType,
        message: description,
        attachmentName: attachmentFile ? attachmentFile.name : (existingComplaint.attachmentName || 'None'),
        attachmentPath: attachmentFile ? URL.createObjectURL(attachmentFile) : (existingComplaint.attachmentPath || '#'), 
        expectedResponse: '14-Days',
        status: isUpdate ? 'Under process (Updated)' : 'Under process...'
    };

    localStorage.setItem('activeComplaint', JSON.stringify(complaint));
    localStorage.removeItem('updateMode'); // Clear the update flag
    
    // Redirect to the confirmation page
    window.location.href = "Complain submitted.html";
}

// 🌟 FINAL FIX: Robust Form Population and State Cleanup 🌟
function populateUpdateForm() {
    // Only run this on the Raise New Complaint page
    if (!window.location.pathname.includes('Raise New Complaint.html')) {
        return;
    }

    const updateMode = localStorage.getItem('updateMode');
    const form = document.querySelector('.form');
    
    if (updateMode === 'true' && form) {
        let complaintData = null;
        try {
            complaintData = JSON.parse(localStorage.getItem('activeComplaint'));
        } catch (e) {
            // Data corruption check
            console.error("Failed to parse activeComplaint data:", e);
        }
        
        const complaintSelect = form.elements['complaint'];
        const descriptionArea = form.elements['description'];

        // --- Core Logic Block ---
        if (complaintData && complaintData.id && complaintSelect && descriptionArea) {
            // SUCCESS: All data and elements are present. Proceed with filling.
            
            // Pre-filling logic
            complaintSelect.value = complaintData.type;
            descriptionArea.value = complaintData.message;
            
            // UI updates
            const heading = document.querySelector('.complaint-form h2');
            if (heading) {
                heading.innerHTML = `<i class="fas fa-edit"></i> Update Complaint: ${complaintData.id}`;
                heading.style.color = '#00009c';
            }
            
            const fileUploadDiv = document.querySelector('.file-upload');
            if (fileUploadDiv) {
                 // Check if attachment info is already added to prevent duplicates on soft reloads
                 if (!fileUploadDiv.innerHTML.includes('Current attachment')) {
                    fileUploadDiv.innerHTML += `
                        <p style="margin-top: 5px; font-size: 0.9em; color: gray;">
                            Current attachment: <a href="${complaintData.attachmentPath}" target="_blank">${complaintData.attachmentName}</a>
                            <br>
                            (Choose a new file above to replace it.)
                        </p>
                    `;
                 }
            }
        } else {
            // CRITICAL STATE RESET: If the flag is set, but we failed to find the data or elements.
            // Clear the flag and force a clean reload to sync the state.
            localStorage.removeItem('updateMode'); 
            console.warn("Update data missing or elements not ready. Forcing state reset.");
            
            // This is the safety check: Reload the page immediately to clear the flag and load the default form.
            window.location.reload(); 
        }
    } else {
        // If not in update mode, ensure the form displays the default "Raise New Complaint" heading
        const heading = document.querySelector('.complaint-form h2');
        if (heading && heading.innerHTML.includes('Update Complaint')) {
            heading.innerHTML = `<i class="fas fa-hand-rock"></i> Raise New Complaint`;
            heading.style.color = 'red';
        }
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
        return `<p style="text-align: center;">Your complaint history is empty.</p>`;
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
    if (!document.title.includes('User Dashboard') || document.title.includes('Complaint Status')) {
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
                <center><i class="fas fa-times-circle" style="color: red; font-size: 500%;"></i></center>
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
                </center>
                <br><br>
            `;
        } else {
            container.innerHTML = `
                <center><i class="fas fa-times-circle" style="color: red; font-size: 500%;"></i></center>
                <br>
                <center>
                    <h2 style="text-align: center; color: red;">No Active Complaint to Track</h2>
                    <p>Please raise a new complaint first.</p>
                </center>
            `;
        }
    }
}


function initDirectConnect() {
    const modal = document.getElementById('connect-modal');
    const overlay = document.getElementById('modal-overlay');
    const directConnectBtn = document.getElementById('direct-connect');
    const closeModalBtn = document.getElementById('close-modal');
    const entityOptions = document.getElementById('entity-options');
    const connectOptions = document.getElementById('connect-options');
    const whatsappLink = document.getElementById('whatsapp-link');
    const phoneLink = document.getElementById('phoneLink');

    if (directConnectBtn) {
        directConnectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            overlay.style.display = 'block';
            entityOptions.style.display = 'block';
            connectOptions.style.display = 'none';
        });

        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        });

        overlay.addEventListener('click', () => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        });

        document.querySelectorAll('.entity-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedEntity = e.target.getAttribute('data-entity');
                entityOptions.style.display = 'none';
                connectOptions.style.display = 'block';

                whatsappLink.href = `https://wa.me/1234567890?text=Hello%20${selectedEntity}`;
                phoneLink.href = `tel:+1234567890`;
            });
        });
    }
}

function handleConfirmationRedirect() {
    if (document.title.includes("Complaint Submitted - Confirmation")) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                window.location.href = "Active Complain.html";
            }, 5000); 
        });
    }
}

// --- GLOBAL INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadActiveOrHistoryView();
    fetchTrackStatus(); 
    initDirectConnect();
});

window.addEventListener('load', populateUpdateForm);

handleConfirmationRedirect();