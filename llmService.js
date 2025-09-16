// Simple LLM Service for Health Chatbot
// Uses Hugging Face Inference API for minimal setup

const { HfInference } = require('@huggingface/inference');
const fs = require('fs');
const path = require('path');

class SimpleHealthLLM {
    constructor() {
        // Initialize Hugging Face client (free tier)
        this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY || 'hf_demo');
        
        // Use a model that works with Hugging Face Inference API
        this.modelName = 'microsoft/DialoGPT-medium';
        
        // Load training data
        this.trainingData = this.loadTrainingData();
        
        console.log('🤖 Simple Health LLM initialized');
    }

    /**
     * Load training data from file
     */
    loadTrainingData() {
        try {
            const trainingPath = path.join(__dirname, 'trainingData.json');
            if (fs.existsSync(trainingPath)) {
                const rawData = fs.readFileSync(trainingPath);
                return JSON.parse(rawData);
            }
        } catch (error) {
            console.log('⚠️ No training data found, using basic health knowledge');
        }
        
        // Default basic health training data
        return {
            conversations: [
                {
                    input: "what are flu symptoms",
                    output: "Flu symptoms include fever, cough, sore throat, body aches, headache, and fatigue. Visit a doctor if symptoms are severe or last more than a week.",
                    language: "en"
                },
                {
                    input: "फ्लू के लक्षण क्या हैं",
                    output: "फ्लू के लक्षणों में बुखार, खांसी, गले में दर्द, शरीर में दर्द, सिरदर्द और थकान शामिल हैं। यदि लक्षण गंभीर हैं या एक सप्ताह से अधिक रहते हैं तो डॉक्टर से मिलें।",
                    language: "hi"
                }
            ],
            lastTrained: new Date().toISOString()
        };
    }

    /**
     * Generate response using LLM with health context
     */
    async generateResponse(userInput, language = 'en') {
        try {
            console.log(`🤖 LLM processing: "${userInput}" (${language})`);
            
            // Try conversational API first (better for chat models)
            try {
                const response = await this.hf.conversational({
                    model: this.modelName,
                    inputs: {
                        past_user_inputs: [],
                        generated_responses: [],
                        text: this.createHealthPrompt(userInput, language)
                    },
                    parameters: {
                        max_length: 150,
                        temperature: 0.7
                    }
                });

                let llmResponse = response.generated_text.trim();
                llmResponse = this.cleanResponse(llmResponse);
                
                console.log(`✅ LLM response generated: ${llmResponse.substring(0, 50)}...`);
                return llmResponse;
                
            } catch (convError) {
                console.log('🔄 Conversational API failed, trying text generation...');
                
                // Fallback to text generation
                const response = await this.hf.textGeneration({
                    model: 'gpt2',
                    inputs: this.createHealthPrompt(userInput, language),
                    parameters: {
                        max_new_tokens: 100,
                        temperature: 0.7,
                        return_full_text: false
                    }
                });

                let llmResponse = response.generated_text.trim();
                llmResponse = this.cleanResponse(llmResponse);
                
                console.log(`✅ LLM fallback response: ${llmResponse.substring(0, 50)}...`);
                return llmResponse;
            }
            
        } catch (error) {
            console.error('❌ LLM Error:', error.message);
            
            // Try smart health knowledge fallback
            console.log('🧠 Trying smart health fallback...');
            const smartResponse = this.getSmartHealthResponse(userInput, language);
            if (smartResponse) {
                console.log('✅ Smart health response generated');
                return smartResponse;
            }
            
            return null; // Will fallback to JSON matching
        }
    }

    /**
     * Smart health knowledge fallback when LLM fails
     */
    getSmartHealthResponse(userInput, language) {
        const input = userInput.toLowerCase();
        
        // Common health patterns and responses
        const healthPatterns = {
            'pain': {
                en: "Pain can have many causes. For persistent pain, rest, apply ice/heat as appropriate, and consult a healthcare provider if it lasts more than a few days or is severe.",
                hi: "दर्द के कई कारण हो सकते हैं। लगातार दर्द के लिए आराम करें, उचित रूप से बर्फ/गर्मी लगाएं, और यदि यह कुछ दिनों से अधिक रहता है या गंभीर है तो स्वास्थ्य सेवा प्रदाता से सलाह लें।",
                or: "ଯନ୍ତ୍ରଣାର ଅନେକ କାରଣ ହୋଇପାରେ। ନିରନ୍ତର ଯନ୍ତ୍ରଣା ପାଇଁ ବିଶ୍ରାମ ନିଅନ୍ତୁ, ଉପଯୁକ୍ତ ରୂପରେ ବରଫ/ଗରମ ଲଗାନ୍ତୁ, ଏବଂ ଯଦି ଏହା କିଛି ଦିନରୁ ଅଧିକ ରହେ କିମ୍ବା ଗମ୍ଭୀର ହୁଏ ତେବେ ସ୍ୱାସ୍ଥ୍ୟ ସେବା ପ୍ରଦାନକାରୀଙ୍କ ସହିତ ପରାମର୍ଶ କରନ୍ତୁ।"
            },
            'cough': {
                en: "Coughs can be due to viral infections, allergies, or irritants. Stay hydrated, use honey for soothing, and see a doctor if cough persists for more than 2 weeks or has blood.",
                hi: "खांसी वायरल संक्रमण, एलर्जी या परेशान करने वाले पदार्थों के कारण हो सकती है। हाइड्रेटेड रहें, शहद का उपयोग करें, और यदि खांसी 2 सप्ताह से अधिक रहती है या खून है तो डॉक्टर से मिलें।",
                or: "କାଶ ଭାଇରାଲ ସଂକ୍ରମଣ, ଆଲର୍ଜି କିମ୍ବା ଉତ୍ତେଜକ କାରଣରୁ ହୋଇପାରେ। ହାଇଡ୍ରେଟେଡ ରୁହନ୍ତୁ, ମହୁ ବ୍ୟବହାର କରନ୍ତୁ, ଏବଂ ଯଦି କାଶ 2 ସପ୍ତାହରୁ ଅଧିକ ରହେ କିମ୍ବା ରକ୍ତ ଥାଏ ତେବେ ଡାକ୍ତରଙ୍କୁ ଦେଖାନ୍ତୁ।"
            },
            'headache': {
                en: "Headaches can be caused by stress, dehydration, lack of sleep, or eyestrain. Rest in a dark room, stay hydrated, and consider over-the-counter pain relief if needed.",
                hi: "सिरदर्द तनाव, निर्जलीकरण, नींद की कमी या आंखों पर जोर के कारण हो सकता है। अंधेरे कमरे में आराम करें, हाइड्रेटेड रहें, और जरूरत पड़ने पर दर्द निवारक दवा लेने पर विचार करें।",
                or: "ମୁଣ୍ଡବିନ୍ଧା ଚାପ, ନିର୍ଜଳୀକରଣ, ନିଦ୍ରା ଅଭାବ କିମ୍ବା ଆଖି ଉପରେ ଚାପ କାରଣରୁ ହୋଇପାରେ। ଅନ୍ଧାର କୋଠରୀରେ ବିଶ୍ରାମ କରନ୍ତୁ, ହାଇଡ୍ରେଟେଡ ରୁହନ୍ତୁ, ଏବଂ ଆବଶ୍ୟକ ହେଲେ ଯନ୍ତ୍ରଣା ନିବାରକ ଔଷଧ ନେବାକୁ ବିଚାର କରନ୍ତୁ।"
            }
        };
        
        // Check for pattern matches
        for (const [pattern, responses] of Object.entries(healthPatterns)) {
            if (input.includes(pattern)) {
                return responses[language] || responses.en;
            }
        }
        
        return null;
    }

    /**
     * Create health-focused prompt for LLM
     */
    createHealthPrompt(userInput, language) {
        const languageInstructions = {
            'en': 'Respond in English',
            'hi': 'Respond in Hindi',
            'or': 'Respond in Oriya'
        };

        return `You are a helpful health assistant. Provide accurate, concise health information.

User Question: ${userInput}

Instructions:
- ${languageInstructions[language] || 'Respond in English'}
- Focus on health topics only
- Include when to see a doctor
- Keep response under 100 words
- Be empathetic and helpful

Response:`;
    }

    /**
     * Clean and validate LLM response
     */
    cleanResponse(response) {
        // Remove any unwanted text, ensure it's health-focused
        response = response.replace(/^\s*Response:\s*/i, '');
        response = response.replace(/\n+/g, ' ');
        response = response.trim();
        
        // Ensure it ends properly
        if (!response.match(/[.!?]$/)) {
            response += '.';
        }
        
        return response;
    }

    /**
     * Add new training example
     */
    addTrainingExample(input, output, language) {
        const newExample = {
            input: input.toLowerCase(),
            output,
            language,
            timestamp: new Date().toISOString()
        };
        
        this.trainingData.conversations.push(newExample);
        
        // Save to file
        this.saveTrainingData();
        
        console.log(`📚 Added training example: "${input}" -> "${output.substring(0, 30)}..."`);
    }

    /**
     * Save training data to file
     */
    saveTrainingData() {
        try {
            const trainingPath = path.join(__dirname, 'trainingData.json');
            fs.writeFileSync(trainingPath, JSON.stringify(this.trainingData, null, 2));
            console.log('💾 Training data saved');
        } catch (error) {
            console.error('❌ Error saving training data:', error.message);
        }
    }

    /**
     * Simple training function - learns from interactions
     */
    async trainFromInteraction(userInput, botResponse, isCorrect, language) {
        if (isCorrect) {
            // Add successful interaction to training data
            this.addTrainingExample(userInput, botResponse, language);
        } else {
            // Log unsuccessful interaction for review
            console.log(`❌ Incorrect response logged: "${userInput}" -> "${botResponse}"`);
        }
    }

    /**
     * Get training statistics
     */
    getTrainingStats() {
        return {
            totalExamples: this.trainingData.conversations.length,
            languages: [...new Set(this.trainingData.conversations.map(c => c.language))],
            lastTrained: this.trainingData.lastTrained,
            lastExample: this.trainingData.conversations[this.trainingData.conversations.length - 1]
        };
    }
}

module.exports = SimpleHealthLLM;