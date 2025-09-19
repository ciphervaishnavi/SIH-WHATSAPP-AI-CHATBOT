// Global variables
let currentUser = null;
// Auto-detect API base URL - use localhost:3000 for local development, relative path for Netlify
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkUserSession();
    
    // Add smooth scrolling
    setupSmoothScrolling();
    
    // Setup form handlers
    setupFormHandlers();
});

// Check if user is already logged in
function checkUserSession() {
    const token = localStorage.getItem('healthbot_token');
    const userData = localStorage.getItem('healthbot_user');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        showLoggedInState();
    }
}

// Setup smooth scrolling for navigation
function setupSmoothScrolling() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// Setup form event handlers
function setupFormHandlers() {
    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    // Don't disable body scrolling, let modal handle its own scrolling
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }, 100);
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function openRegisterModal() {
    openModal('registerModal');
}

function openLoginModal() {
    openModal('loginModal');
}

function openDashboardModal() {
    openModal('dashboardModal');
    updateDashboardInfo();
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Scroll to features
function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({
        behavior: 'smooth'
    });
}

// Show loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Handle registration
async function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('fullName'), // Backend expects 'name', form sends 'fullName'
        email: formData.get('email'),
        phone: formData.get('countryCode') + formData.get('phone'),
        language: formData.get('language'),
        password: formData.get('password'),
        terms: formData.get('terms')
    };
    
    console.log('📋 Registration data:', userData);
    
    // Validate phone number
    if (!isValidPhoneNumber(userData.phone)) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }
    
    // Validate terms acceptance
    if (!userData.terms) {
        showNotification('Please accept the terms and conditions', 'error');
        return;
    }
    
    showLoading();
    
    // Send all required fields to the backend
    const registrationData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        language: userData.language,
        password: userData.password,
        terms: userData.terms
    };
    
    console.log('📤 Sending registration data:', registrationData);
    
    try {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });
        
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            console.error('Invalid JSON response:', jsonError);
            showNotification('Server error. Please try again.', 'error');
            return;
        }
        
        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            closeModal('registerModal');
            setTimeout(() => openLoginModal(), 1000);
            
            // Clear form
            document.getElementById('registerForm').reset();
        } else {
            showNotification(result.error || result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        rememberMe: formData.get('rememberMe')
    };
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            console.error('Invalid JSON response:', jsonError);
            showNotification('Server error. Please try again.', 'error');
            return;
        }
        
        if (response.ok) {
            // Merge temporary registration data if available
            const tempPhone = localStorage.getItem('temp_user_phone');
            const tempLanguage = localStorage.getItem('temp_user_language');
            
            if (tempPhone || tempLanguage) {
                result.user.phone = tempPhone;
                result.user.language = tempLanguage;
                
                // Clean up temporary data
                localStorage.removeItem('temp_user_phone');
                localStorage.removeItem('temp_user_language');
            }
            
            // Store user data and token
            localStorage.setItem('healthbot_token', result.token);
            localStorage.setItem('healthbot_user', JSON.stringify(result.user));
            currentUser = result.user;
            
            showNotification('Login successful!', 'success');
            closeModal('loginModal');
            showLoggedInState();
            
            // Clear form
            document.getElementById('loginForm').reset();
        } else {
            showNotification(result.error || result.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Show logged in state
function showLoggedInState() {
    // Update navbar
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.innerHTML = `<i class="fas fa-tachometer-alt"></i> Dashboard`;
        loginBtn.onclick = openDashboardModal;
    }
    
    // Auto-open dashboard for new logins
    setTimeout(() => openDashboardModal(), 500);
}

// Update dashboard info
function updateDashboardInfo() {
    if (!currentUser) return;
    
    // Update welcome message
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.fullName}!`;
    
    // Update user info
    document.getElementById('userPhoneDisplay').textContent = currentUser.phone;
    document.getElementById('userLanguageDisplay').textContent = getLanguageName(currentUser.language);
    
    // Update stats (these would come from actual usage data)
    document.getElementById('totalMessages').textContent = currentUser.totalMessages || '0';
    document.getElementById('lastActive').textContent = currentUser.lastActive || 'Never';
}

// Get language name
function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'hi': 'Hindi (हिंदी)',
        'or': 'Oriya (ଓଡ଼ିଆ)'
    };
    return languages[code] || 'English';
}

// Start WhatsApp chat
async function startWhatsAppChat() {
    if (!currentUser) {
        showNotification('Please login first', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Get phone number from user or prompt for it
        let phoneNumber = currentUser.phone;
        
        // If no phone number stored, prompt user to enter it
        if (!phoneNumber) {
            phoneNumber = prompt('Please enter your WhatsApp phone number (with country code):');
            if (!phoneNumber) {
                showNotification('Phone number is required for WhatsApp registration', 'error');
                return;
            }
        }
        
        console.log('📱 Registering phone number:', phoneNumber);
        
        // Register user for WhatsApp chat
        const response = await fetch(`${API_BASE}/api/register-whatsapp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('healthbot_token')}`
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber, // Backend expects 'phoneNumber'
                language: currentUser.language || 'en'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Create WhatsApp link
            const whatsappNumber = '15551461259'; // Your business WhatsApp number
            const message = encodeURIComponent(getWelcomeMessage(currentUser.language));
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
            
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
            
            showNotification('Opening WhatsApp chat...', 'success');
        } else {
            showNotification(result.error || result.message || 'Failed to register for WhatsApp', 'error');
        }
    } catch (error) {
        console.error('WhatsApp registration error:', error);
        showNotification('Failed to start WhatsApp chat', 'error');
    } finally {
        hideLoading();
    }
}

// Get welcome message in user's language
function getWelcomeMessage(language) {
    const messages = {
        'en': 'Hello! I would like to start using the Arogyam AI service.',
        'hi': 'नमस्ते! मैं Arogyam AI सेवा का उपयोग करना चाहूंगा।',
        'or': 'ନମସ୍କାର! ମୁଁ Arogyam AI ସେବା ବ୍ୟବହାର କରିବାକୁ ଚାହେଁ।'
    };
    return messages[language] || messages['en'];
}

// Update settings
async function updateSettings() {
    if (!currentUser) return;
    
    const settings = {
        dailyTips: document.getElementById('dailyTips').checked,
        emailNotifications: document.getElementById('emailNotifications').checked
    };
    
    showLoading();
    
    try {
        // For now, just simulate settings update since we don't have this endpoint
        setTimeout(() => {
            showNotification('Settings updated successfully!', 'success');
            hideLoading();
        }, 1000);
    } catch (error) {
        console.error('Settings update error:', error);
        showNotification('Failed to update settings', 'error');
        hideLoading();
    }
}

// Logout
function logout() {
    localStorage.removeItem('healthbot_token');
    localStorage.removeItem('healthbot_user');
    currentUser = null;
    
    // Reset navbar
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
        loginBtn.onclick = openLoginModal;
    }
    
    closeModal('dashboardModal');
    showNotification('Logged out successfully!', 'success');
}

// Utility functions
function isValidPhoneNumber(phone) {
    // Basic phone number validation
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(phone);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 4000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(300px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(300px);
        }
    }
`;
document.head.appendChild(notificationStyles);