// Netlify Function for WhatsApp Webhook
const axios = require('axios');
const crypto = require('crypto');

// Inline Facebook Service for Netlify Functions
class FacebookWhatsAppService {
    constructor() {
        this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
        this.phoneNumberId = process.env.FACEBOOK_PHONE_NUMBER_ID;
        this.verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
        this.appSecret = process.env.FACEBOOK_APP_SECRET;
        this.baseUrl = 'https://graph.facebook.com/v18.0';
    }

    isConfigured() {
        return !!(this.accessToken && this.phoneNumberId && this.verifyToken);
    }

    async sendMessage(to, message) {
        if (!this.accessToken || !this.phoneNumberId) {
            console.log('❌ Cannot send message: Facebook credentials missing');
            return false;
        }

        try {
            const cleanTo = to.replace(/^\+/, '');
            const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
            
            const payload = {
                messaging_product: 'whatsapp',
                to: cleanTo,
                type: 'text',
                text: { body: message }
            };

            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`✅ Message sent successfully to ${cleanTo}`);
            return true;
        } catch (error) {
            console.error('❌ Send message error:', error.message);
            return false;
        }
    }

    async markAsRead(messageId) {
        if (!this.accessToken || !this.phoneNumberId) return false;

        try {
            const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
            const payload = {
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId
            };

            await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return true;
        } catch (error) {
            console.error('❌ Mark as read error:', error.message);
            return false;
        }
    }
}

// Initialize services
let facebookService;
try {
    facebookService = new FacebookWhatsAppService();
} catch (error) {
    console.error('❌ Error initializing Facebook service:', error.message);
}

// Health data (inline for Netlify functions)
const healthData = {
    "qa": [
        {
            "keywords": ["fever", "बुखार", "ଜ୍ୱର", "temperature"],
            "answer": {
                "en": "For fever: Rest, drink plenty of fluids, and take paracetamol if needed. Consult a doctor if fever persists over 3 days or exceeds 102°F.",
                "hi": "बुखार के लिए: आराम करें, पर्याप्त तरल पदार्थ पिएं, और जरूरत पड़ने पर पैरासिटामोल लें। यदि बुखार 3 दिन से अधिक रहे या 102°F से अधिक हो तो डॉक्टर से सलाह लें।",
                "or": "ଜ୍ୱର ପାଇଁ: ବିଶ୍ରାମ ନିଅନ୍ତୁ, ପର୍ଯ୍ୟାପ୍ତ ତରଳ ପଦାର୍ଥ ପିଅନ୍ତୁ, ଏବଂ ଆବଶ୍ୟକ ହେଲେ ପାରାସିଟାମଲ ନିଅନ୍ତୁ। ଯଦି ଜ୍ୱର 3 ଦିନରୁ ଅଧିକ ରହେ କିମ୍ବା 102°F ରୁ ଅଧିକ ହୁଏ ତେବେ ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।"
            }
        },
        {
            "keywords": ["headache", "सिरदर्द", "ମୁଣ୍ଡବିନ୍ଧା"],
            "answer": {
                "en": "For headaches: Rest in a quiet, dark room, apply a cold compress, stay hydrated, and consider mild pain relievers. See a doctor for severe or persistent headaches.",
                "hi": "सिरदर्द के लिए: शांत, अंधेरे कमरे में आराम करें, ठंडी पट्टी लगाएं, हाइड्रेटेड रहें, और हल्के दर्द निवारक दवाओं पर विचार करें। गंभीर या लगातार सिरदर्द के लिए डॉक्टर से मिलें।",
                "or": "ମୁଣ୍ଡବିନ୍ଧା ପାଇଁ: ଶାନ୍ତ, ଅନ୍ଧାର କୋଠରୀରେ ବିଶ୍ରାମ ନିଅନ୍ତୁ, ଥଣ୍ଡା ସେକ ଦିଅନ୍ତୁ, ହାଇଡ୍ରେଟେଡ ରୁହନ୍ତୁ, ଏବଂ ହାଲୁକା ଯନ୍ତ୍ରଣା ନିବାରକ ଔଷଧ ବିଷୟରେ ଚିନ୍ତା କରନ୍ତୁ। ଗମ୍ଭୀର କିମ୍ବା ଦୀର୍ଘସ୍ଥାୟୀ ମୁଣ୍ଡବିନ୍ଧା ପାଇଁ ଡାକ୍ତରଙ୍କୁ ଦେଖାନ୍ତୁ।"
            }
        },
        {
            "keywords": ["migraine", "माइग्रेन", "ମାଇଗ୍ରେନ"],
            "answer": {
                "en": "For migraines: Rest in a dark, quiet room, apply cold compress to head/neck, stay hydrated, avoid triggers like bright lights. Take prescribed migraine medication if available.",
                "hi": "माइग्रेन के लिए: अंधेरे, शांत कमरे में आराम करें, सिर/गर्दन पर ठंडी पट्टी लगाएं, हाइड्रेटेड रहें, तेज रोशनी जैसे ट्रिगर से बचें। यदि उपलब्ध हो तो निर्धारित माइग्रेन की दवा लें।",
                "or": "ମାଇଗ୍ରେନ ପାଇଁ: ଅନ୍ଧାର, ଶାନ୍ତ କୋଠରୀରେ ବିଶ୍ରାମ ନିଅନ୍ତୁ, ମୁଣ୍ଡ/ବେକରେ ଥଣ୍ଡା ସେକ ଦିଅନ୍ତୁ, ହାଇଡ୍ରେଟେଡ ରୁହନ୍ତୁ, ଉଜ୍ଜ୍ୱଳ ଆଲୋକ ପରି ଟ୍ରିଗର ଠାରୁ ଦୂରେ ରୁହନ୍ତୁ। ଯଦି ଉପଲବ୍ଧ ହୁଏ ତେବେ ନିର୍ଦ୍ଦିଷ୍ଟ ମାଇଗ୍ରେନ ଔଷଧ ନିଅନ୍ତୁ।"
            }
        }
    ]
};

// Google LLM Service (inline)
async function getGoogleLLMResponse(message, language) {
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_LLM_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompts = {
            en: `You are a helpful health assistant. Answer this health question briefly and accurately: "${message}". Keep response under 200 characters. Be concise and helpful.`,
            hi: `आप एक सहायक स्वास्थ्य सहायक हैं। इस स्वास्थ्य प्रश्न का संक्षेप में और सटीक उत्तर दें: "${message}"। उत्तर 200 अक्षरों के अंदर रखें।`,
            or: `ଆପଣ ଜଣେ ସହାୟକ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ। ଏହି ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରଶ୍ନର ସଂକ୍ଷିପ୍ତ ଏବଂ ସଠିକ ଉତ୍ତର ଦିଅନ୍ତୁ: "${message}"। ଉତ୍ତର 200 ଅକ୍ଷରର ମଧ୍ୟରେ ରଖନ୍ତୁ।`
        };

        const result = await model.generateContent(prompts[language] || prompts.en);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Google LLM Error:', error.message);
        return null;
    }
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
                            
                            // If no health response found, try Google LLM
                            if (!response) {
                                try {
                                    if (process.env.GOOGLE_LLM_API_KEY) {
                                        response = await getGoogleLLMResponse(userMessage, language);
                                        console.log('🤖 Google LLM Response:', response?.substring(0, 50) + '...');
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
                                console.log('🔧 Demo mode - would send:', response?.substring(0, 50) + '...');
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