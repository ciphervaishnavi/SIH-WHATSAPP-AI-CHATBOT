// Netlify Function for WhatsApp Webhook
const FacebookWhatsAppService = require('../../facebookService');
const SimpleHealthLLM = require('../../llmService');
const googleLLMService = require('../../googleLLMService');
const fs = require('fs');
const path = require('path');

// Initialize services
let facebookService;
try {
    facebookService = new FacebookWhatsAppService();
} catch (error) {
    console.error('❌ Error initializing Facebook service:', error.message);
}

// Load health data
const healthDataPath = path.join(__dirname, '../../healthData.json');
let healthData = {};
try {
    const data = fs.readFileSync(healthDataPath, 'utf8');
    healthData = JSON.parse(data);
} catch (error) {
    console.error('❌ Error loading health data:', error.message);
}

// Utility functions
function detectLanguage(message) {
    const hindiWords = ['हैलो', 'नमस्ते', 'स्वास्थ्य', 'बुखार', 'सिरदर्द', 'दवा', 'डॉक्टर', 'अस्पताल', 'इलाज', 'बीमारी'];
    const oriyaWords = ['ନମସ୍କାର', 'ହେଲୋ', 'ସ୍ୱାସ୍ଥ୍ୟ', 'ଜ୍ୱର', 'ମୁଣ୍ଡବିନ୍ଧା', 'ଔଷଧ', 'ଡାକ୍ତର', 'ଚିକିତ୍ସାଳୟ', 'ଚିକିତ୍ସା', 'ରୋଗ'];
    
    const lowerMessage = message.toLowerCase();
    
    if (hindiWords.some(word => lowerMessage.includes(word))) {
        return 'hi';
    }
    if (oriyaWords.some(word => lowerMessage.includes(word))) {
        return 'or';
    }
    return 'en';
}

function findHealthResponse(userMessage, language) {
    const normalizedMessage = userMessage.toLowerCase().trim();
    
    // Check Q&A section
    if (healthData.qa && Array.isArray(healthData.qa)) {
        for (const item of healthData.qa) {
            const keywords = item.keywords || [];
            const hasMatch = keywords.some(keyword => 
                normalizedMessage.includes(keyword.toLowerCase())
            );
            
            if (hasMatch && item.answer && item.answer[language]) {
                return item.answer[language];
            }
        }
    }
    
    return null;
}

exports.handler = async (event, context) => {
    const { httpMethod, queryStringParameters, body } = event;
    
    // Handle GET request for webhook verification
    if (httpMethod === 'GET') {
        const mode = queryStringParameters['hub.mode'];
        const token = queryStringParameters['hub.verify_token'];
        const challenge = queryStringParameters['hub.challenge'];
        
        if (mode && token) {
            if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
                console.log('✅ Webhook verified successfully');
                return {
                    statusCode: 200,
                    body: challenge
                };
            } else {
                console.log('❌ Webhook verification failed');
                return {
                    statusCode: 403,
                    body: 'Forbidden'
                };
            }
        }
        
        return {
            statusCode: 400,
            body: 'Bad Request'
        };
    }
    
    // Handle POST request for incoming messages
    if (httpMethod === 'POST') {
        try {
            const data = JSON.parse(body);
            
            if (data.object === 'whatsapp_business_account') {
                const entry = data.entry?.[0];
                const changes = entry?.changes?.[0];
                const value = changes?.value;
                
                if (value?.messages) {
                    for (const message of value.messages) {
                        const from = message.from;
                        const messageType = message.type;
                        
                        if (messageType === 'text') {
                            const userMessage = message.text.body;
                            const language = detectLanguage(userMessage);
                            
                            console.log(`📱 Received message from ${from}: ${userMessage} (Language: ${language})`);
                            
                            // Mark message as read
                            if (facebookService && facebookService.isConfigured()) {
                                try {
                                    await facebookService.markAsRead(message.id);
                                } catch (error) {
                                    console.error('❌ Error marking message as read:', error.message);
                                }
                            }
                            
                            let response = null;
                            
                            // Try health data first
                            response = findHealthResponse(userMessage, language);
                            
                            // If no health response found, try LLM services
                            if (!response) {
                                try {
                                    // Try Google LLM first
                                    if (googleLLMService.isConfigured()) {
                                        response = await googleLLMService.getHealthResponse(userMessage, language);
                                        console.log('🤖 Google LLM Response:', response);
                                    }
                                    
                                    // If Google LLM fails, try Hugging Face
                                    if (!response && SimpleHealthLLM.isConfigured()) {
                                        response = await SimpleHealthLLM.getHealthResponse(userMessage, language);
                                        console.log('🤖 Hugging Face LLM Response:', response);
                                    }
                                } catch (error) {
                                    console.error('❌ LLM Error:', error.message);
                                }
                            }
                            
                            // Default fallback responses
                            if (!response) {
                                const fallbackResponses = {
                                    en: "I understand you're asking about health. While I can help with general health information, please consult a healthcare professional for specific medical advice.",
                                    hi: "मैं समझ गया हूँ कि आप स्वास्थ्य के बारे में पूछ रहे हैं। हालांकि मैं सामान्य स्वास्थ्य जानकारी में मदद कर सकता हूँ, कृपया विशिष्ट चिकित्सा सलाह के लिए किसी स्वास्थ्य पेशेवर से सलाह लें।",
                                    or: "ମୁଁ ବୁଝିଲି ଯେ ଆପଣ ସ୍ୱାସ୍ଥ୍ୟ ବିଷୟରେ ପଚାରୁଛନ୍ତି। ଯଦିଓ ମୁଁ ସାଧାରଣ ସ୍ୱାସ୍ଥ୍ୟ ସୂଚନାରେ ସାହାଯ୍ୟ କରିପାରିବି, ଦୟାକରି ନିର୍ଦ୍ଦିଷ୍ଟ ଚିକିତ୍ସା ପରାମର୍ଶ ପାଇଁ ଜଣେ ସ୍ୱାସ୍ଥ୍ୟ ବିଶେଷଜ୍ଞଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।"
                                };
                                response = fallbackResponses[language] || fallbackResponses.en;
                            }
                            
                            // Send response
                            if (facebookService && facebookService.isConfigured() && response) {
                                try {
                                    await facebookService.sendMessage(from, response);
                                    console.log(`✅ Response sent to ${from}: ${response.substring(0, 50)}...`);
                                } catch (error) {
                                    console.error('❌ Error sending message:', error.message);
                                }
                            } else {
                                console.log('🔧 Demo mode - would send:', response);
                            }
                        }
                    }
                }
            }
            
            return {
                statusCode: 200,
                body: 'OK'
            };
        } catch (error) {
            console.error('❌ Webhook error:', error.message);
            return {
                statusCode: 500,
                body: 'Internal Server Error'
            };
        }
    }
    
    return {
        statusCode: 405,
        body: 'Method Not Allowed'
    };
};