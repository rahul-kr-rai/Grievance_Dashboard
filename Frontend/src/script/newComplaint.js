// --- 3. COMPLAINT SUBMISSION AND STORAGE LOGIC (Raise New Complaint.html) ---

async function saveComplaintData(event) {
    event.preventDefault();

    const form = event.target;
    const complaintType = form.elements['complaint'].value;
    const description = form.elements['description'].value;
    const attachmentFile = form.elements['file'].files[0];

    if (!complaintType || !description) {
        showPopup('Please fill in all required fields.', 'error');
        return;
    }

    try {
        const updateComplaintId = new URLSearchParams(window.location.search).get('updateId');
        const isUpdate = Boolean(updateComplaintId);
        let existingComplaint = isUpdate ? await getComplaintById(updateComplaintId) : {};

        const loggedInUser = typeof getLoggedInUser === 'function' ? getLoggedInUser() : window.__authUser;
        let complaint = {
            citizenName: loggedInUser && loggedInUser.name ? loggedInUser.name : 'Citizen',
            citizenEmail: loggedInUser && loggedInUser.email ? loggedInUser.email : '',
            citizenPhone: loggedInUser && loggedInUser.phone ? loggedInUser.phone : 'N/A',
            type: complaintType,
            message: description,
            attachmentName: attachmentFile ? attachmentFile.name : (existingComplaint.attachmentName || 'None'),
            attachmentPath: attachmentFile ? URL.createObjectURL(attachmentFile) : (existingComplaint.attachmentPath || '#')
        };

        if (isUpdate && updateComplaintId) {
            complaint.id = updateComplaintId;
        }

        // Call submitComplaintToDB - now async
        if (typeof submitComplaintToDB === 'function') {
            const generatedId = await submitComplaintToDB(complaint, isUpdate);

            if (generatedId) {
                showPopup(isUpdate ? 'Complaint updated successfully!' : 'Complaint submitted successfully!', 'success');
                // Redirect to the confirmation page
                setTimeout(() => {
                    window.location.href = "Complain submitted.html?id=" + encodeURIComponent(generatedId);
                }, 1000);
            } else {
                showPopup('Error submitting complaint. Please try again.', 'error');
            }
        } else {
            console.error("submitComplaintToDB is not available. Ensure db.js is loaded.");
            showPopup('Database error. Please refresh the page.', 'error');
        }
    } catch (error) {
        console.error('Error saving complaint:', error);
        showPopup('An error occurred while submitting the complaint.', 'error');
    }
}

// 🌟 FINAL FIX: Robust Form Population and State Cleanup 🌟
// ---- Robust populateUpdateForm() ----
function populateUpdateForm() {
    // If the form elements aren't present, do nothing (this makes the function safe to include on every page)
    const complaintSelect = document.getElementById('complaint');
    const descriptionArea = document.getElementById('description');
    if (!complaintSelect || !descriptionArea) return; // not on the Raise New Complaint page

    const updateComplaintId = new URLSearchParams(window.location.search).get('updateId');
    if (!updateComplaintId) return;

    if (typeof getComplaintById !== 'function') {
        console.warn("Update requested but complaint DB helper is not loaded.");
        return;
    }

    getComplaintById(updateComplaintId).then(complaintData => {
        if (!complaintData || !complaintData.id) {
            console.warn("Update requested but complaint data is missing. Clearing update state.");
            return;
        }

        complaintSelect.value = complaintData.type || '';
        descriptionArea.value = complaintData.message || '';

        const heading = document.querySelector('.complaint-form h2');
        if (heading) {
            heading.innerHTML = `<i class="fas fa-edit"></i> Update Complaint: ${complaintData.id}`;
            heading.style.color = '#00009c';
        }

        const fileUploadDiv = document.querySelector('.file-upload');
        if (fileUploadDiv && complaintData.attachmentName) {
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
    });
}

// --- 5. CONFIRMATION PAGE REDIRECTION LOGIC (Complain submitted.html) ---

function handleConfirmationRedirect() {
    if (document.title.includes("Complaint Submitted - Confirmation")) {
        window.addEventListener('load', function() {
            const submittedId = new URLSearchParams(window.location.search).get('id');
            const idHeading = document.querySelector('.complaint-Submitted h3');
            if (idHeading && submittedId) {
                idHeading.textContent = 'Your Complaint ID: ' + submittedId;
            }

            setTimeout(function() {
                window.location.href = "Active Complain.html" + (submittedId ? "?complaintId=" + encodeURIComponent(submittedId) : "");
            }, 5000); 
        });
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', populateUpdateForm);

handleConfirmationRedirect();
