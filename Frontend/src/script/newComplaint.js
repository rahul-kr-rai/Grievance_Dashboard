// --- 3. COMPLAINT SUBMISSION AND STORAGE LOGIC (Raise New Complaint.html) ---

async function saveComplaintData(event) {
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
    
    // Create FormData for the backend POST
    const formData = new FormData();
    formData.append('type', complaintType);
    formData.append('description', description);
    formData.append('isUpdate', isUpdate);
    if(isUpdate && existingComplaint.id) formData.append('id', existingComplaint.id);
    if(attachmentFile) formData.append('file', attachmentFile);

    try {
        const response = await fetch('/api/complaints', {
            method: 'POST',
            body: formData
        });
        
        const complaint = await response.json();

        // Update local storage so other legacy scripts can still read active user state smoothly for now
        localStorage.setItem('activeComplaint', JSON.stringify(complaint));
        localStorage.removeItem('updateMode'); // Clear the update flag
        
        // Redirect to the confirmation page
        window.location.href = "Complain submitted.html";
    } catch (err) {
        console.error("Error saving complaint to backend:", err);
        alert("Failed to save complaint. Please try again or check backend connection.");
    }
}

// 🌟 FINAL FIX: Robust Form Population and State Cleanup 🌟
// ---- Robust populateUpdateForm() ----
function populateUpdateForm() {
    // If the form elements aren't present, do nothing (this makes the function safe to include on every page)
    const complaintSelect = document.getElementById('complaint');
    const descriptionArea = document.getElementById('description');
    if (!complaintSelect || !descriptionArea) return; // not on the Raise New Complaint page

    // Check updateMode explicitly (string 'true' expected)
    const updateMode = localStorage.getItem('updateMode') === 'true';
    if (!updateMode) return; // not an update action

    // Try to parse active complaint data
    let complaintData = null;
    try {
        complaintData = JSON.parse(localStorage.getItem('activeComplaint'));
    } catch (e) {
        console.error("Failed to parse activeComplaint:", e);
    }

    if (!complaintData || !complaintData.id) {
        console.warn("Update requested but activeComplaint data is missing. Clearing updateMode.");
        // Clear the flag so future loads don't keep trying to update
        localStorage.removeItem('updateMode');
        return;
    }

    // Populate fields
    complaintSelect.value = complaintData.type || '';
    descriptionArea.value = complaintData.message || '';

    // Update heading (if present)
    const heading = document.querySelector('.complaint-form h2');
    if (heading) {
        heading.innerHTML = `<i class="fas fa-edit"></i> Update Complaint: ${complaintData.id}`;
        heading.style.color = '#00009c';
    }

    // Show current attachment link if available (and avoid duplicating it)
    const fileUploadDiv = document.querySelector('.file-upload');
    if (fileUploadDiv && complaintData.attachmentName) {
        // Only add the "current attachment" UI once
        if (!fileUploadDiv.innerHTML.includes('Current attachment')) {
            const attachHtml = `
                <p style="margin-top: 5px; font-size: 0.9em; color: gray;">
                    Current attachment: <a href="${complaintData.attachmentPath}" target="_blank">${complaintData.attachmentName}</a>
                    <br>(Choose a new file above to replace it.)
                </p>
            `;
            fileUploadDiv.insertAdjacentHTML('beforeend', attachHtml);
        }
    }
}

// --- 5. CONFIRMATION PAGE REDIRECTION LOGIC (Complain submitted.html) ---

function handleConfirmationRedirect() {
    if (document.title.includes("Complaint Submitted - Confirmation")) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                window.location.href = "Active Complain.html";
            }, 5000); 
        });
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', populateUpdateForm);

handleConfirmationRedirect();