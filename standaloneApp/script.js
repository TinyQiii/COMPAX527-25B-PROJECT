// script.js

document.addEventListener('DOMContentLoaded', () => {

    // ------------------- Map Initialization (Choropleth Map) -------------------
    const map = L.map('map').setView([20, 0], 2);

    // FIX FOR RED MAP: Using a more reliable map tile provider (Stamen Toner)
    // You can also use CartoDB: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Store the COVID-19 data in a global variable
    let covidData = {};

    // Function to get a color based on the number of cases
    function getColor(cases) {
        return cases > 10000000 ? '#800026' :
               cases > 5000000  ? '#BD0026' :
               cases > 1000000  ? '#E31A1C' :
               cases > 500000   ? '#FC4E2A' :
               cases > 100000   ? '#FD8D3C' :
               cases > 50000    ? '#FEB24C' :
               cases > 10000    ? '#FED976' :
                                  '#FFEDA0';
    }

    // Function to style each country's polygon
    function style(feature) {
        const countryName = feature.properties.name;
        const countryData = covidData[countryName];
        const cases = countryData ? countryData.cases : 0;
        return {
            fillColor: getColor(cases),
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    // Function to display the choropleth map with COVID-19 data
    async function displayChoroplethMap() {
        try {
            // Step 1: Fetch COVID-19 data
            const response = await fetch('https://disease.sh/v3/covid-19/countries');
            const data = await response.json();
            
            // Convert the array into a map for quick lookup
            data.forEach(country => {
                covidData[country.country] = country;
            });

            // Step 2: Fetch GeoJSON data (the shapes of the countries)
            const geojsonResponse = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
            const geojsonData = await geojsonResponse.json();

            // Step 3: Add the GeoJSON layer to the map
            L.geoJson(geojsonData, {
                style: style,
                onEachFeature: function onEachFeature(feature, layer) {
                    const countryName = feature.properties.name;
                    const countryData = covidData[countryName];
                    if (countryData) {
                        layer.bindPopup(`
                            <b>${countryData.country}</b><br>
                            Cases: ${countryData.cases.toLocaleString()}<br>
                            Deaths: ${countryData.deaths.toLocaleString()}<br>
                            Recovered: ${countryData.recovered.toLocaleString()}
                        `);
                    }
                }
            }).addTo(map);

        } catch (error) {
            console.error('Error fetching data:', error);
            // You can add a visual error message to the map container here
        }
    }

    // ------------------- Other Dashboard Functions (Combined) -------------------
    
    // UI Toggles
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const navItems = document.querySelectorAll('.nav-menu li');
    const contentViews = document.querySelectorAll('.content-view');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.target;
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            contentViews.forEach(view => {
                view.classList.remove('active');
                if (view.id === target) {
                    view.classList.add('active');
                }
            });
        });
    });

    // Fetch and display global statistics
    async function fetchStatsAndChartData() {
        try {
            const global_api_url = 'https://disease.sh/v3/covid-19/all';
            const globalResponse = await fetch(global_api_url);
            const globalData = await globalResponse.json();

            document.getElementById('confirmed-cases').textContent = globalData.cases.toLocaleString();
            document.getElementById('deaths').textContent = globalData.deaths.toLocaleString();
            document.getElementById('recovered').textContent = globalData.recovered.toLocaleString();
            document.getElementById('total-recovered').textContent = globalData.recovered.toLocaleString();

            const casesChartCtx = document.getElementById('cases-chart').getContext('2d');
            const mockDates = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
            const mockCases = [1000, 5000, 20000, 50000, 100000, 150000, 200000];
            
            new Chart(casesChartCtx, {
                type: 'line',
                data: {
                    labels: mockDates,
                    datasets: [{
                        label: 'Global Cases',
                        data: mockCases,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching stats or chart data:', error);
        }
    }

    // ------------------- Visitor Information Functions -------------------
    
    // Function to get visitor's IP and location information
    async function getVisitorIPInfo() {
        try {
            // Using ipapi.co service for IP geolocation
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            // Update IP information
            document.getElementById('visitor-ip').textContent = data.ip || 'Unknown';
            document.getElementById('visitor-country').textContent = data.country_name || 'Unknown';
            document.getElementById('visitor-city').textContent = data.city || 'Unknown';
            document.getElementById('visitor-isp').textContent = data.org || 'Unknown';
            
        } catch (error) {
            console.error('Error fetching IP info:', error);
            // Fallback to another service
            try {
                const fallbackResponse = await fetch('https://ipinfo.io/json');
                const fallbackData = await fallbackResponse.json();
                
                document.getElementById('visitor-ip').textContent = fallbackData.ip || 'Failed to fetch';
                document.getElementById('visitor-country').textContent = fallbackData.country || 'Failed to fetch';
                document.getElementById('visitor-city').textContent = fallbackData.city || 'Failed to fetch';
                document.getElementById('visitor-isp').textContent = fallbackData.org || 'Failed to fetch';
            } catch (fallbackError) {
                console.error('Fallback IP service also failed:', fallbackError);
                document.getElementById('visitor-ip').textContent = 'Failed to fetch';
                document.getElementById('visitor-country').textContent = 'Failed to fetch';
                document.getElementById('visitor-city').textContent = 'Failed to fetch';
                document.getElementById('visitor-isp').textContent = 'Failed to fetch';
            }
        }
    }
    
    // Function to get device and browser information
    function getDeviceInfo() {
        const userAgent = navigator.userAgent;
        
        // Get operating system
        let os = 'Unknown';
        if (userAgent.indexOf('Win') !== -1) os = 'Windows';
        else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
        else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
        else if (userAgent.indexOf('Android') !== -1) os = 'Android';
        else if (userAgent.indexOf('iOS') !== -1) os = 'iOS';
        
        // Get browser
        let browser = 'Unknown';
        if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
        else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
        else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
        else if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';
        else if (userAgent.indexOf('Opera') !== -1) browser = 'Opera';
        
        // Get screen resolution
        const resolution = `${screen.width} x ${screen.height}`;
        
        // Get language
        const language = navigator.language || navigator.userLanguage || 'Unknown';
        
        // Get timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        
        // Get current time
        const currentTime = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Update device information
        document.getElementById('visitor-os').textContent = os;
        document.getElementById('visitor-browser').textContent = browser;
        document.getElementById('visitor-resolution').textContent = resolution;
        document.getElementById('visitor-language').textContent = language;
        document.getElementById('visitor-timezone').textContent = timezone;
        document.getElementById('visitor-time').textContent = currentTime;
    }
    
    // Function to initialize visitor information
    function initializeVisitorInfo() {
        // Get device info immediately (client-side)
        getDeviceInfo();
        
        // Get IP info asynchronously
        getVisitorIPInfo();
    }

    // ------------------- Authentication Functions -------------------
    
    let currentUser = null;
    let authToken = localStorage.getItem('authToken');

    // Check if user is logged in on page load
    if (authToken) {
        checkAuthStatus();
    }

    // Authentication status check
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    currentUser = data.user;
                    updateUserInterface();
                } else {
                    // Invalid token
                    localStorage.removeItem('authToken');
                    authToken = null;
                }
            } else {
                // Token expired or invalid
                localStorage.removeItem('authToken');
                authToken = null;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            localStorage.removeItem('authToken');
            authToken = null;
        }
    }

    // Update user interface based on login status
    function updateUserInterface() {
        const userName = document.getElementById('user-name');
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userProfileNav = document.getElementById('user-profile-nav');

        if (currentUser) {
            userName.textContent = currentUser.name;
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            userProfileNav.style.display = 'block';
            loadUserProfile();
        } else {
            userName.textContent = 'Guest';
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            userProfileNav.style.display = 'none';
        }
    }

    // Load user profile data
    async function loadUserProfile() {
        if (!currentUser) return;

        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    updateProfileDisplay(data.user);
                    loadLoginHistory();
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // Update profile display
    function updateProfileDisplay(user) {
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-join-date').textContent = `Joined: ${new Date(user.createdAt).toLocaleDateString()}`;
        document.getElementById('profile-login-count').textContent = user.loginCount || 0;
        document.getElementById('profile-last-login').textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';
    }

    // Load login history
    async function loadLoginHistory() {
        if (!currentUser) return;

        try {
            const response = await fetch('/api/login-history', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    displayLoginHistory(data.loginHistory);
                }
            }
        } catch (error) {
            console.error('Error loading login history:', error);
        }
    }

    // Display login history
    function displayLoginHistory(history) {
        const container = document.getElementById('login-history-list');
        
        if (history.length === 0) {
            container.innerHTML = '<p>No login history found</p>';
            return;
        }

        const historyHTML = history.map(session => `
            <div class="login-history-item">
                <div class="login-history-item-header">
                    <strong>Login Session</strong>
                    <span class="login-history-time">${new Date(session.loginTime).toLocaleString()}</span>
                </div>
                <div class="login-history-details">
                    <div class="login-history-detail">
                        <span class="login-history-detail-label">IP Address</span>
                        <span class="login-history-detail-value">${session.ip}</span>
                    </div>
                    <div class="login-history-detail">
                        <span class="login-history-detail-label">Browser</span>
                        <span class="login-history-detail-value">${session.deviceInfo.browser}</span>
                    </div>
                    <div class="login-history-detail">
                        <span class="login-history-detail-label">OS</span>
                        <span class="login-history-detail-value">${session.deviceInfo.os}</span>
                    </div>
                    <div class="login-history-detail">
                        <span class="login-history-detail-label">Resolution</span>
                        <span class="login-history-detail-value">${session.deviceInfo.resolution}</span>
                    </div>
                    <div class="login-history-detail">
                        <span class="login-history-detail-label">Language</span>
                        <span class="login-history-detail-value">${session.deviceInfo.language}</span>
                    </div>
                    <div class="login-history-detail">
                        <span class="login-history-detail-label">Timezone</span>
                        <span class="login-history-detail-value">${session.deviceInfo.timezone}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = historyHTML;
    }

    // Login function
    async function login(email, password) {
        try {
            const deviceData = getDeviceInfo();
            
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    ...deviceData
                })
            });

            const data = await response.json();

            if (data.success) {
                authToken = data.token;
                localStorage.setItem('authToken', authToken);
                currentUser = data.user;
                updateUserInterface();
                closeModal('login-modal');
                showNotification('Login successful!', 'success');
                
                // Store login session in DynamoDB (handled by backend)
                console.log('User logged in:', currentUser.name);
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Login failed. Please try again.', 'error');
        }
    }

    // Register function
    async function register(name, email, password) {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                authToken = data.token;
                localStorage.setItem('authToken', authToken);
                currentUser = data.user;
                updateUserInterface();
                closeModal('register-modal');
                showNotification('Registration successful!', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Registration failed. Please try again.', 'error');
        }
    }

    // Logout function
    function logout() {
        localStorage.removeItem('authToken');
        authToken = null;
        currentUser = null;
        updateUserInterface();
        showNotification('Logged out successfully', 'info');
    }

    // Modal functions
    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Event listeners for authentication
    document.getElementById('login-btn').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('login-modal');
    });

    document.getElementById('register-btn').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('register-modal');
    });

    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Login form submission
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        login(email, password);
    });

    // Register form submission
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        register(name, email, password);
    });

    // Modal close buttons
    document.getElementById('close-login').addEventListener('click', () => {
        closeModal('login-modal');
    });

    document.getElementById('close-register').addEventListener('click', () => {
        closeModal('register-modal');
    });

    // Switch between login and register modals
    document.getElementById('switch-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('login-modal');
        openModal('register-modal');
    });

    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('register-modal');
        openModal('login-modal');
    });

    // User dropdown toggle
    document.getElementById('user-profile').addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const userProfile = document.getElementById('user-profile');
        const dropdown = document.getElementById('user-dropdown');
        
        if (!userProfile.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    // Call all the main functions
    displayChoroplethMap();
    fetchStatsAndChartData();
    
    // Initialize visitor information when page loads
    initializeVisitorInfo();

});



