// WhatsApp Health Chatbot using Node.js and Facebook Business API
// This chatbot educates users on health topics and sends outbreak alerts

// Import required packages
const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');

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

// Store user phone numbers for daily alerts
let userContacts = new Set();

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
    
    console.log('🔍 Webhook verification request received');
    
    const verificationResult = facebookService.verifyWebhook(mode, token, challenge);
    
    if (verificationResult) {
        res.status(200).send(challenge);
    } else {
        res.status(403).send('Verification failed');
    }
});

// Main webhook endpoint for WhatsApp messages
app.post('/webhook', async (req, res) => {
    try {
        console.log('\n📨 ===== WEBHOOK RECEIVED =====');
        console.log('📥 Full request body:', JSON.stringify(req.body, null, 2));
        console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
        console.log('===============================\n');
        
        // Verify webhook signature for security
        const signature = req.headers['x-hub-signature-256'];
        if (!facebookService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
            console.log('❌ Webhook signature verification failed');
            return res.status(403).send('Unauthorized');
        }
        
        // Parse Facebook webhook message
        const messageData = facebookService.parseWebhookMessage(req.body);
        
        if (!messageData) {
            console.log('⚠️ No message data found in webhook');
            return res.status(200).send('OK');
        }
        
        const { messageId, from, text, name } = messageData;
        
        console.log('📨 Extracted data:');
        console.log(`   Message: "${text}"`);
        console.log(`   From: ${from} (${name})`);
        console.log(`   Message ID: ${messageId}`);
        
        // Skip if empty message
        if (!text || text.trim().length === 0) {
            console.log('⚠️ Empty message received, skipping');
            return res.status(200).send('OK');
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
        
        // Respond to Facebook webhook (required)
        res.status(200).send('OK');
        
    } catch (error) {
        console.error('❌ Error processing webhook:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).send('Internal Server Error');
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