// Local cache for complaints
let complaintCache = [];

async function loadComplaintStats() {
    try {
        const allComplaints = await fetch(`${window.location.origin}/api/complaints`)
            .then(r => r.json())
            .then(data => data.complaints || []);
        complaintCache = allComplaints;
        return allComplaints;
    } catch (error) {
        console.error('Error loading complaints:', error);
        return complaintCache;
    }
}

async function initProfileCard() {
    const userIcon = document.querySelector('.fas.fa-user-circle');
    if (!userIcon) return;
    const userIconParent = userIcon.parentElement;

    if (!document.getElementById('profile-card')) {
        // Load complaints from API
        const allComplaints = await loadComplaintStats();

        const isDepartment = window.location.pathname.includes('/department/');
        const isMukhiya   = window.location.pathname.includes('/mukhiya/');

        const profileCard = document.createElement('div');
        profileCard.id = 'profile-card';
        profileCard.className = 'profile-card';

        const session = typeof getLoggedInUser === 'function' ? getLoggedInUser() : window.__authUser;
        const sessionName  = session && session.name ? session.name : '';
        const sessionEmail = session && session.email ? session.email : '';
        const sessionPhone = session && session.phone ? session.phone : '';

        // Dynamic complaint counts from live ComplaintDB
        const totalAll       = allComplaints.length;
        const totalResolved  = allComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
        const totalNew       = allComplaints.filter(c => c.status === 'New').length;
        const userComplaints = allComplaints.filter(c => c.citizenName === sessionName);
        const userResolved   = userComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

        let userData;
        if (isMukhiya) {
            userData = {
                name:  sessionName  || 'Mukhiya',
                role:  'Panchayat Head',
                email: sessionEmail || 'mukhiya@panchayat.gov.in',
                phone: sessionPhone || '',
                img:   '/Frontend/src/image/Department.png',
                stat1: { val: totalAll,      label: 'Total Cases' },
                stat2: { val: totalResolved, label: 'Resolved' }
            };
        } else if (isDepartment) {
            userData = {
                name:  sessionName  || 'Admin',
                role:  'Department Admin',
                email: sessionEmail || 'admin@grievance.gov.in',
                phone: sessionPhone || '',
                img:   '/Frontend/src/image/Department.png',
                stat1: { val: totalResolved, label: 'Resolved' },
                stat2: { val: totalNew,      label: 'Pending' }
            };
        } else {
            userData = {
                name:  sessionName  || 'Citizen',
                role:  'Citizen',
                email: sessionEmail || '',
                phone: sessionPhone || '',
                img:   '/Frontend/src/image/Citizen.png',
                stat1: { val: userComplaints.length, label: 'Complaints' },
                stat2: { val: userResolved,          label: 'Resolved' }
            };
        }

        // Update the Navbar welcome text dynamically
        const navTitle = document.querySelector('.nav-links h1');
        if (navTitle && userData.name) {
            navTitle.innerText = 'Welcome ' + userData.name;
        }

        profileCard.innerHTML = `
            <div class="profile-card-header" style="background: ${isDepartment ? '#1a237e' : '#00009c'}">
                <img src="${userData.img}" alt="Profile" class="profile-img">
                <div class="profile-info">
                    <h3>${userData.name}</h3>
                    <p>${userData.role}</p>
                </div>
            </div>
            <div class="profile-card-body">
                <div class="profile-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${userData.email || '<em style="color:#aaa;">Not set</em>'}</span>
                </div>
                <div class="profile-detail">
                    <i class="fas fa-phone"></i>
                    <span>${userData.phone || '<em style="color:#aaa;">Not set</em>'}</span>
                </div>
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-value">${userData.stat1.val}</span>
                        <span class="stat-label">${userData.stat1.label}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${userData.stat2.val}</span>
                        <span class="stat-label">${userData.stat2.label}</span>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="profile-btn"><i class="fas fa-user-edit"></i> Edit Profile</button>
                    <button class="profile-btn"><i class="fas fa-cog"></i> Settings</button>
                    <button class="profile-btn logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
                </div>
            </div>
        `;
        document.body.appendChild(profileCard);

        // Logout: clear session keys and redirect to home
        profileCard.querySelector('.logout-btn').addEventListener('click', async () => {
            try {
                logoutUser();
                window.location.href = '/Frontend/src/index.html';
            } catch (error) {
                console.error('Logout error:', error);
                window.location.href = '/Frontend/src/index.html';
            }
        });

        // Toggle visibility
        userIconParent.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            profileCard.style.display = profileCard.style.display === 'block' ? 'none' : 'block';
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!profileCard.contains(e.target) && e.target !== userIconParent && !userIconParent.contains(e.target)) {
                profileCard.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initProfileCard);
