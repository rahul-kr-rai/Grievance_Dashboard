function initProfileCard() {
    const userIcon = document.querySelector('.fas.fa-user-circle').parentElement;

    if (!document.getElementById('profile-card')) {
        const isDepartment = window.location.pathname.includes('/department/');
        const isMukhiya = window.location.pathname.includes('/mukhiya/');
        
        const profileCard = document.createElement('div');
        profileCard.id = 'profile-card';
        profileCard.className = 'profile-card';

        const citizenName = localStorage.getItem('loggedInCitizenName') || 'Rahul Kumar';
        const citizenEmail = localStorage.getItem('loggedInCitizenEmail') || 'rahul.kumar@email.com';
        const citizenPhone = localStorage.getItem('loggedInCitizenPhone') || '+91 9876543210';

        // Calculate dynamic stats
        let totalComplaints = "0";
        if (!isDepartment && !isMukhiya && typeof SimulatedDB !== 'undefined' && SimulatedDB.allComplaints) {
            const userComplaints = SimulatedDB.allComplaints.filter(c => c.citizenName === citizenName);
            totalComplaints = userComplaints.length.toString();
        }

        let userData;
        if (isMukhiya) {
            userData = {
                name: "Mukhiya Ji",
                role: "Panchayat Head",
                email: "mukhiya@panchayat.gov.in",
                phone: "+91 9988776655",
                img: "/Frontend/src/image/Department.png", // Reusing department icon or specify another
                stat1: { val: "85", label: "Total Cases" },
                stat2: { val: "4.7", label: "Approval" }
            };
        } else if (isDepartment) {
            userData = {
                name: "Officer Rajesh",
                role: "Department Admin",
                email: "rajesh.admin@grievance.gov.in",
                phone: "+91 8877665544",
                img: "/Frontend/src/image/Department.png",
                stat1: { val: "60", label: "Resolved" },
                stat2: { val: "4.5", label: "KPI Score" }
            };
        } else {
            userData = {
                name: citizenName,
                role: "Citizen",
                email: citizenEmail,
                phone: citizenPhone,
                img: "/Frontend/src/image/Citizen.png",
                stat1: { val: totalComplaints, label: "Complaints" },
                stat2: { val: "4.8", label: "Rating" }
            };
        }

        // Update the Navbar welcome text
        const navTitle = document.querySelector('.nav-links h1');
        if (navTitle && !isDepartment && !isMukhiya) {
            navTitle.innerText = 'Welcome ' + citizenName;
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
                    <span>${userData.email}</span>
                </div>
                <div class="profile-detail">
                    <i class="fas fa-phone"></i>
                    <span>${userData.phone}</span>
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

        // Add Logout Logic
        profileCard.querySelector('.logout-btn').addEventListener('click', () => {
            window.location.href = '/Frontend/src/index.html';
        });

        // Toggle Logic
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            profileCard.style.display = profileCard.style.display === 'block' ? 'none' : 'block';
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!profileCard.contains(e.target) && e.target !== userIcon && !userIcon.contains(e.target)) {
                profileCard.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initProfileCard);
