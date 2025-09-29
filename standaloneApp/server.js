// Function to show a notification message
function showNotification(message, type) {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        console.error('Notification container not found. Please add <div id="notification-container"></div> to your HTML.');
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`; // 'success', 'error', 'info'
    notification.textContent = message;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => {
        notification.remove();
    };

    notification.appendChild(closeBtn);
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('hide');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        });
    }, 5000);
}

// Check for existing token on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt');
    if (token) {
        verifyToken(token);
    }
});

// User authentication logic
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const userProfileDropdown = document.getElementById('user-profile-nav');
const userNameSpan = document.getElementById('user-name');
const userIcon = document.getElementById('user-icon');

// Open login modal
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'block';
});

// Open register modal
registerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'block';
});

// Handle modal close buttons
document.querySelectorAll('.modal .close').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').style.display = 'none';
    });
});

// Handle modal switching
document.getElementById('switch-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
});

document.getElementById('switch-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'block';
});

// User registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(data.message, 'success');
            registerModal.style.display = 'none';
        } else {
            showNotification(`Registration failed: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('An unexpected error occurred. Please try again later.', 'error');
    }
});

// User login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('jwt', data.token);
            showNotification('Login successful!', 'success');
            loginModal.style.display = 'none';
            // Update UI after successful login
            verifyToken(data.token);
        } else {
            showNotification(`Login failed: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('An unexpected error occurred. Please try again later.', 'error');
    }
});

// User logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('jwt');
    showNotification('Logged out successfully.', 'info');
    updateUIForGuest();
});

// Function to verify the token and update the UI
const verifyToken = async (token) => {
    try {
        const response = await fetch('/api/verify-token', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
            updateUIForLoggedInUser(data.user);
        } else {
            // Token is invalid or expired
            localStorage.removeItem('jwt');
            updateUIForGuest();
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('jwt');
        updateUIForGuest();
    }
};

// Functions to update UI based on user state
const updateUIForLoggedInUser = (user) => {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    userProfileDropdown.style.display = 'block';
    userNameSpan.textContent = user.name;
    // Show the user-profile content view
    document.getElementById('user-profile').style.display = 'block';
};

const updateUIForGuest = () => {
    loginBtn.style.display = 'block';
    registerBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    userProfileDropdown.style.display = 'none';
    userNameSpan.textContent = 'Guest';
    // Hide the user-profile content view if not on that page
    document.getElementById('user-profile').style.display = 'none';
};
