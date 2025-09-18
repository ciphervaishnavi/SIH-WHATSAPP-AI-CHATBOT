// WhatsApp Health Chatbot using Node.js and Facebook Business API
// This chatbot educates users on health topics and sends outbreak alerts

// Import required packages
const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load environment variables from .env file FIRST
try {
    require('dotenv').config();
} catch (error) {
    console.log('dotenv not found, using environment variables directly');
}

// Import LLM services for advanced responses (after env vars loaded)
const SimpleHealthLLM = require('./llmService');
const googleLLMService = require('./googleLLMService');
const FacebookWhatsAppService = require('./facebookService');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-healthbot-2025';

// Initialize Facebook WhatsApp Business service
let facebookService;
try {
    facebookService = new FacebookWhatsAppService();
    if (facebookService.isConfigured()) {
        console.log('✅ Facebook WhatsApp Business service initialized successfully');
    } else {
        console.log('⚠️ Facebook WhatsApp credentials not configured. Bot will run in demo mode.');
        console.log('📝 Please set Facebook credentials in your .env file');
    }
} catch (error) {
    console.error('❌ Error initializing Facebook service:', error.message);
    console.log('📝 Bot will run in demo mode without WhatsApp integration');
}

// Middleware to parse incoming webhook data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from public directory

// Store user phone numbers for daily alerts
let userContacts = new Set();

// User database helpers
function loadUsers() {
    try {
        const usersPath = path.join(__dirname, 'users.json');
        const rawData = fs.readFileSync(usersPath);
        return JSON.parse(rawData);
    } catch (error) {
        return { users: [], registeredNumbers: [], userStats: {} };
    }
}

function saveUsers(userData) {
    try {
        const usersPath = path.join(__dirname, 'users.json');
        fs.writeFileSync(usersPath, JSON.stringify(userData, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Initialize LLM service
let llmService;
try {
    llmService = new SimpleHealthLLM();
    console.log('✅ LLM service initialized');
} catch (error) {
    console.error('⚠️ LLM service initialization failed:', error.message);
    console.log('📝 Bot will use JSON matching only');
}

// Load health data from JSON file
let healthData;
try {
    const healthDataPath = path.join(__dirname, 'healthData.json');
    const rawData = fs.readFileSync(healthDataPath);
    healthData = JSON.parse(rawData);
    console.log('✅ Health data loaded successfully');
} catch (error) {
    console.error('❌ Error loading health data:', error.message);
    process.exit(1);
}

/**
 * Function to detect language from user input
 * Simple detection based on presence of Hindi or Oriya characters
 * @param {string} text - User input text
 * @returns {string} - Language code ('hi' for Hindi, 'or' for Oriya, 'en' for English)
 */
function detectLanguage(text) {
    // Check if text contains Oriya characters (Odia script)
    const oriyaPattern = /[\u0B00-\u0B7F]/;
    if (oriyaPattern.test(text)) {
        return 'or';
    }
    
    // Check if text contains Hindi characters (Devanagari script)
    const hindiPattern = /[\u0900-\u097F]/;
    if (hindiPattern.test(text)) {
        return 'hi';
    }
    
    // Default to English
    return 'en';
}

/**
 * Function to find matching health question based on keywords
 * Uses simple string matching with case-insensitive comparison
 * @param {string} userInput - User's message
 * @param {string} language - Detected language
 * @returns {string|null} - Response message or null if no match
 */
function findHealthResponse(userInput, language) {
    const input = userInput.toLowerCase().trim();
    
    // Search through all questions in health data
    for (const question of healthData.questions) {
        // Check if any keyword matches the user input
        for (const keyword of question.keywords) {
            if (input.includes(keyword.toLowerCase())) {
                // Return response in detected language
                return question.response[language] || question.response.en;
            }
        }
    }
    
    // Return null if no match found
    return null;
}

/**
 * Function to get default response when no match is found
 * @param {string} language - Language code
 * @returns {string} - Default response message
 */
function getDefaultResponse(language) {
    if (language === 'hi') {
        return "माफ करें, मैं समझ नहीं पाया। कृपया फ्लू, डेंगू, मलेरिया, डायबिटीज, या टीकाकरण के बारे में पूछें। मैं इन स्वास्थ्य विषयों में आपकी मदद कर सकता हूं।";
    } else if (language === 'or') {
        return "ଦୁଃଖିତ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ। ଦୟାକରି ଫ୍ଲୁ, ଡେଙ୍ଗୁ, ମ୍ୟାଲେରିଆ, ମଧୁମେହ, କିମ୍ବା ଟିକାକରଣ ବିଷୟରେ ପଚାରନ୍ତୁ। ମୁଁ ଏହି ସ୍ୱାସ୍ଥ୍ୟ ବିଷୟଗୁଡ଼ିକରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି।";
    } else {
        return "Sorry, I don't understand. Please ask about flu, dengue, malaria, diabetes, vaccines, or other health topics. I'm here to help with health information!";
    }
}

/**
 * Function to send WhatsApp message using Facebook Business API
 * @param {string} to - Recipient's WhatsApp number
 * @param {string} message - Message to send
 */
async function sendWhatsAppMessage(to, message) {
    try {
        if (!facebookService || !facebookService.isConfigured()) {
            console.log('🤖 Demo Mode - Would send message:', message.substring(0, 100) + '...');
            return true;
        }
        
        const result = await facebookService.sendMessage(to, message);
        if (result) {
            console.log(`📱 Message sent successfully to ${to}`);
        }
        return result;
    } catch (error) {
        console.error(`❌ Error sending message to ${to}:`, error.message);
        // Don't throw error in webhook context, just log it
        console.log('⚠️ Continuing webhook processing despite send error...');
        return false;
    }
}

/**
 * Function to send daily outbreak alerts to all registered users
 */
async function sendDailyAlerts() {
    console.log('🚨 Sending daily health alerts...');
    
    if (userContacts.size === 0) {
        console.log('📭 No users registered for alerts');
        return;
    }
    
    // Get random alert from health data
    const alerts = healthData.alerts;
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    
    // Send alert to all users
    for (const userNumber of userContacts) {
        try {
            // Detect user's preferred language (default to English)
            // In a real app, you'd store user language preferences
            const alertMessage = randomAlert.message.en; // Default to English
            await sendWhatsAppMessage(userNumber, alertMessage);
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`❌ Failed to send alert to ${userNumber}:`, error.message);
        }
    }
    
    console.log(`✅ Daily alerts sent to ${userContacts.size} users`);
}

// Test endpoint to simulate webhook for local testing
app.post('/test', (req, res) => {
    console.log('🧪 Test endpoint called');
    
    // Simulate a test message
    const testMessages = [
        'flu symptoms',
        'डेंगू के लक्षण', 
        'ଫ୍ଲୁ ଲକ୍ଷଣ'
    ];
    
    testMessages.forEach((message, index) => {
        setTimeout(() => {
            const detectedLanguage = detectLanguage(message);
            const response = findHealthResponse(message, detectedLanguage) || getDefaultResponse(detectedLanguage);
            console.log(`\n🔸 Test ${index + 1}:`);
            console.log(`📝 Input: ${message}`);
            console.log(`🗣️ Language: ${detectedLanguage === 'hi' ? 'Hindi' : detectedLanguage === 'or' ? 'Oriya' : 'English'}`);
            console.log(`🤖 Response: ${response.substring(0, 100)}...`);
        }, index * 1000);
    });
    
    res.json({ 
        message: 'Test completed! Check console for results.',
        status: 'success'
    });
});

// Webhook verification endpoint (required by Facebook)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    console.log('🔍 Webhook verification request received:', { mode, token, challenge });
    console.log('🔑 Expected verify token:', process.env.FACEBOOK_VERIFY_TOKEN);
    console.log('🔍 All env vars present:', {
        hasAccessToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
        hasPhoneId: !!process.env.FACEBOOK_PHONE_NUMBER_ID,
        hasVerifyToken: !!process.env.FACEBOOK_VERIFY_TOKEN,
        hasAppSecret: !!process.env.FACEBOOK_APP_SECRET
    });
    
    // Direct verification without service dependency
    if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully');
        res.status(200).send(challenge);
    } else {
        console.log('❌ Webhook verification failed - token mismatch');
        console.log('❌ Debug info:', {
            modeCheck: mode === 'subscribe',
            tokenCheck: token === process.env.FACEBOOK_VERIFY_TOKEN,
            receivedToken: token,
            expectedToken: process.env.FACEBOOK_VERIFY_TOKEN
        });
        res.status(403).send('Verification failed');
    }
});

// Main webhook endpoint for WhatsApp messages
app.post('/webhook', async (req, res) => {
    // Immediately acknowledge Facebook webhook
    res.status(200).send('OK');
    
    try {
        console.log('\n📨 ===== WEBHOOK RECEIVED =====');
        console.log('📥 Full request body:', JSON.stringify(req.body, null, 2));
        console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
        console.log('===============================\n');
        
        // TEMPORARILY SKIP signature verification for debugging
        // const signature = req.headers['x-hub-signature-256'];
        // if (!facebookService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
        //     console.log('❌ Webhook signature verification failed');
        //     return res.status(403).send('Unauthorized');
        // }
        console.log('⚠️ Webhook signature verification SKIPPED for debugging');
        
        // Parse Facebook webhook message
        const messageData = facebookService.parseWebhookMessage(req.body);
        
        if (!messageData) {
            console.log('⚠️ No message data found in webhook');
            return;
        }
        
        const { messageId, from, text, name } = messageData;
        
        console.log('📨 Extracted data:');
        console.log(`   Message: "${text}"`);
        console.log(`   From: ${from} (${name})`);
        console.log(`   Message ID: ${messageId}`);
        
        // Skip if empty message
        if (!text || text.trim().length === 0) {
            console.log('⚠️ Empty message received, skipping');
            return;
        }
        
        // Mark message as read
        await facebookService.markAsRead(messageId);
        
        // Add user to contacts list for daily alerts
        userContacts.add(from);
        console.log(`👤 User ${from} (${name}) added to alert list (Total: ${userContacts.size})`);
        
        // Detect language from user input
        const detectedLanguage = detectLanguage(text);
        console.log(`🗣️ Detected language: ${detectedLanguage === 'hi' ? 'Hindi' : detectedLanguage === 'or' ? 'Oriya' : 'English'}`);
        
        // Find appropriate health response
        let responseMessage = findHealthResponse(text, detectedLanguage);
        let usedLLM = false;
        
        // If no JSON match found, try Google LLM first, then fallback LLM
        if (!responseMessage) {
            console.log('🤖 No JSON match found, trying Google LLM...');
            
            // Try Google LLM first (most robust)
            try {
                if (googleLLMService.isAvailable()) {
                    responseMessage = await googleLLMService.getHealthResponse(text, detectedLanguage);
                    if (responseMessage) {
                        usedLLM = true;
                        console.log('✅ Google LLM generated response');
                    }
                }
            } catch (error) {
                console.error('❌ Google LLM error:', error.message);
            }
            
            // Fallback to Hugging Face LLM if Google LLM failed
            if (!responseMessage && llmService) {
                console.log('🤖 Trying Hugging Face LLM fallback...');
                try {
                    responseMessage = await llmService.generateResponse(text, detectedLanguage);
                    if (responseMessage) {
                        usedLLM = true;
                        console.log('✅ Hugging Face LLM generated response');
                    }
                } catch (error) {
                    console.error('❌ Hugging Face LLM error:', error.message);
                }
            }
        }
        
        // Use default response if no match found
        if (!responseMessage) {
            responseMessage = getDefaultResponse(detectedLanguage);
            console.log('🤖 Using default response (no keyword match)');
        } else if (!usedLLM) {
            console.log('🎯 Found matching health topic in JSON');
        }
        
        console.log(`🤖 Bot response: ${responseMessage.substring(0, 150)}...`);
        
        // Send response back to user
        const messageSent = await facebookService.sendMessage(from, responseMessage);
        
        if (messageSent) {
            console.log(`✅ Response sent successfully to ${name}`);
        } else {
            console.log(`❌ Failed to send response to ${name}`);
        }
        
        // Log the interaction
        console.log(`💬 Interaction completed`);
        console.log('=================================\n');
        
    } catch (error) {
        console.error('❌ Error processing webhook:', error.message);
        console.error('Stack trace:', error.stack);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        message: 'WhatsApp Health Chatbot is running',
        timestamp: new Date().toISOString(),
        users: userContacts.size
    });
});

// Root endpoint with basic info
app.get('/', (req, res) => {
    res.send(`
        <h1>🏥 WhatsApp Health Chatbot</h1>
        <p>This bot provides health information and sends outbreak alerts via WhatsApp.</p>
        <p><strong>Status:</strong> Running</p>
        <p><strong>Registered Users:</strong> ${userContacts.size}</p>
        <p><strong>Available Topics:</strong> Flu, Dengue, Malaria, Diabetes, Vaccines, TB, Anemia, Hypertension, COVID-19, Diarrhea</p>
        <p><strong>Languages:</strong> English, Hindi, and Oriya</p>
        <hr>
        <p><small>Webhook endpoint: /webhook</small></p>
    `);
});

// Debug endpoint to check environment variables (remove in production)
app.get('/debug-env', (req, res) => {
    res.json({
        hasAccessToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
        hasPhoneId: !!process.env.FACEBOOK_PHONE_NUMBER_ID,
        hasVerifyToken: !!process.env.FACEBOOK_VERIFY_TOKEN,
        hasAppSecret: !!process.env.FACEBOOK_APP_SECRET,
        hasGoogleKey: !!process.env.GOOGLE_LLM_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        verifyTokenPreview: process.env.FACEBOOK_VERIFY_TOKEN ? process.env.FACEBOOK_VERIFY_TOKEN.substring(0, 5) + '...' : 'undefined'
    });
});

// Test endpoint to check message sending capability
app.get('/test-message/:phoneNumber', async (req, res) => {
    try {
        const phoneNumber = req.params.phoneNumber;
        const testMessage = `🤖 Test message from your health chatbot!\n\n✅ Bot is working correctly\n📱 Time: ${new Date().toISOString()}\n🔧 This is a test - you can delete this message`;
        
        console.log(`📤 Sending test message to ${phoneNumber}`);
        
        if (!facebookService || !facebookService.isConfigured()) {
            return res.status(500).json({ error: 'Facebook service not configured' });
        }
        
        const result = await facebookService.sendMessage(phoneNumber, testMessage);
        
        res.json({
            success: true,
            message: 'Test message sent successfully',
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Test message failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// =====================================
// DASHBOARD API ROUTES
// =====================================

// Serve dashboard home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, language, password, terms } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !language || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Validate terms acceptance
        if (!terms) {
            return res.status(400).json({ message: 'You must accept the terms and conditions' });
        }
        
        // Validate phone number format
        const phoneRegex = /^\+\d{10,15}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }
        
        // Load existing users
        const userData = loadUsers();
        
        // Check if email already exists
        const existingUser = userData.users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        // Check if phone already exists
        const existingPhone = userData.users.find(user => user.phone === phone);
        if (existingPhone) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            language,
            password: hashedPassword,
            registeredAt: new Date().toISOString(),
            totalMessages: 0,
            lastActive: null,
            settings: {
                dailyTips: true,
                emailNotifications: true
            }
        };
        
        // Add user to database
        userData.users.push(newUser);
        userData.registeredNumbers.push(phone);
        
        // Save to file
        if (!saveUsers(userData)) {
            return res.status(500).json({ message: 'Failed to save user data' });
        }
        
        console.log(`👤 New user registered: ${name} (${email})`);
        
        res.status(201).json({ 
            message: 'Registration successful',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                language: newUser.language
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Load users
        const userData = loadUsers();
        
        // Find user by email
        const user = userData.users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Update last active
        user.lastActive = new Date().toISOString();
        saveUsers(userData);
        
        // Generate JWT token
        const tokenExpiry = rememberMe ? '30d' : '24h';
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: tokenExpiry }
        );
        
        console.log(`🔑 User logged in: ${user.name} (${user.email})`);
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                language: user.language,
                totalMessages: user.totalMessages,
                lastActive: user.lastActive,
                settings: user.settings
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Register for WhatsApp chat
app.post('/api/register-whatsapp', authenticateToken, (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const userId = req.user.id;
        
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        
        // Load users
        const userData = loadUsers();
        const user = userData.users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Add to registered numbers if not already present
        if (!userData.registeredNumbers.includes(phoneNumber)) {
            userData.registeredNumbers.push(phoneNumber);
        }
        
        // Add to alert contacts
        userContacts.add(phoneNumber);
        
        // Update user stats
        if (!userData.userStats[userId]) {
            userData.userStats[userId] = {
                whatsappRegistered: true,
                registeredAt: new Date().toISOString()
            };
        }
        
        saveUsers(userData);
        
        console.log(`📱 WhatsApp registration: ${user.name} (${phoneNumber})`);
        
        res.json({ 
            message: 'Successfully registered for WhatsApp chat',
            whatsappNumber: process.env.FACEBOOK_PHONE_NUMBER_ID 
        });
        
    } catch (error) {
        console.error('WhatsApp registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user settings
app.post('/api/update-settings', authenticateToken, (req, res) => {
    try {
        const { dailyTips, emailNotifications } = req.body;
        const userId = req.user.id;
        
        // Load users
        const userData = loadUsers();
        const user = userData.users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update settings
        user.settings = {
            dailyTips: dailyTips !== undefined ? dailyTips : user.settings.dailyTips,
            emailNotifications: emailNotifications !== undefined ? emailNotifications : user.settings.emailNotifications
        };
        
        saveUsers(userData);
        
        console.log(`⚙️ Settings updated for: ${user.fullName}`);
        
        res.json({ 
            message: 'Settings updated successfully',
            settings: user.settings
        });
        
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        
        // Load users
        const userData = loadUsers();
        const user = userData.users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const userStats = userData.userStats[userId] || {};
        
        res.json({
            user: {
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                language: user.language,
                totalMessages: user.totalMessages,
                lastActive: user.lastActive,
                settings: user.settings
            },
            stats: userStats
        });
        
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Schedule daily alerts at 9:00 AM IST (UTC+5:30)
// Cron format: second minute hour day-of-month month day-of-week
const alertJob = schedule.scheduleJob('0 0 9 * * *', () => {
    console.log('⏰ Scheduled daily alert triggered');
    sendDailyAlerts();
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully');
    if (alertJob) {
        alertJob.cancel();
    }
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully');
    if (alertJob) {
        alertJob.cancel();
    }
    process.exit(0);
});

// Start the server
app.listen(PORT, () => {
    console.log('🚀 WhatsApp Health Chatbot started successfully!');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🕘 Daily alerts scheduled for 9:00 AM IST`);
    console.log(`📚 Loaded ${healthData.questions.length} health topics`);
    console.log(`🚨 Loaded ${healthData.alerts.length} alert messages`);
    console.log('');
    console.log('📝 To test the bot:');
    console.log('1. Set up Facebook Business WhatsApp API');
    console.log('2. Configure webhook URL: https://your-app.onrender.com/webhook');
    console.log('3. Send messages to your business WhatsApp number');
    console.log('');
    console.log('Environment variables needed:');
    console.log('- FACEBOOK_ACCESS_TOKEN');
    console.log('- FACEBOOK_PHONE_NUMBER_ID');
    console.log('- FACEBOOK_VERIFY_TOKEN');
    console.log('- FACEBOOK_APP_SECRET');
    console.log('- GOOGLE_LLM_API_KEY (recommended)');
});

// Export app for testing
module.exports = app;