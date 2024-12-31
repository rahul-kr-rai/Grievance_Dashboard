// Toggle between login and signup forms
document.getElementById('toggleLink').addEventListener('click', function() {
    let loginForm = document.getElementById('loginForm');
    let signupForm = document.getElementById('signupForm');
    let formTitle = document.getElementById('formTitle');
    let toggleLink = document.getElementById('toggleLink');

    if (loginForm.style.display === 'block') {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        formTitle.textContent = 'Signup';
        toggleLink.textContent = 'Already have an account? Login';
    } else {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        formTitle.textContent = 'Login';
        toggleLink.textContent = 'Don\'t have an account? Signup';
    }
});

// Function to handle signup
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();

    let username = document.getElementById('signupUsername').value;
    let email = document.getElementById('signupEmail').value;
    let password = document.getElementById('signupPassword').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if the email already exists
    let emailExists = users.some(user => user.email === email);
    if (emailExists) {
        alert('Email already exists!');
        return;
    }

    // Save user data to local storage
    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert('User registered successfully!');
    document.getElementById('signupForm').reset();
});

// Function to handle login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    let email = document.getElementById('loginEmail').value;
    let password = document.getElementById('loginPassword').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Validate user credentials
    let validUser = users.find(user => user.email === email && user.password === password);
    if (validUser) {
        alert('Login successful!');
        // Redirect to Google.com
        window.location.href = 'https://www.google.com';
    } else {
        alert('Invalid email or password.');
    }

    document.getElementById('loginForm').reset();
});

// Function to handle forgot password
document.getElementById('forgotPasswordLink').addEventListener('click', function() {
    let email = prompt('Enter your email to reset password:');
    if (email) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let user = users.find(user => user.email === email);
        if (user) {
            let newPassword = prompt('Enter your new password:');
            if (newPassword) {
                user.password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                alert('Password updated successfully!');
                window.location.href = 'https://www.google.com';
            }
        } else {
            alert('Email not found.');
        }
    }
});
