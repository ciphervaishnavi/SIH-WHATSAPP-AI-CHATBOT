// Test script to directly test the bot's response logic without Twilio
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import the Google LLM service
const googleLLMService = require('./googleLLMService');

async function testBotResponses() {
    console.log('🧪 Testing Bot Response System');
    console.log('================================\n');

    // Wait a moment for services to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    const testQuestions = [
        { question: "tell me something about migraine", language: "en" },
        { question: "what causes headache", language: "en" },
        { question: "मुझे माइग्रेन है", language: "hi" },
        { question: "flu symptoms", language: "en" },
        { question: "some random question about health", language: "en" }
    ];

    for (const test of testQuestions) {
        console.log(`🔍 Testing: "${test.question}" (${test.language})`);
        
        try {
            // Test Google LLM first
            if (googleLLMService.isAvailable()) {
                console.log('✅ Google LLM is available');
                const response = await googleLLMService.getHealthResponse(test.question, test.language);
                console.log('🤖 Response:', response);
            } else {
                console.log('❌ Google LLM not available');
                const fallbackResponse = googleLLMService.getSmartHealthFallback(test.question, test.language);
                console.log('🔄 Fallback:', fallbackResponse);
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
        
        console.log('---\n');
    }
}

testBotResponses();