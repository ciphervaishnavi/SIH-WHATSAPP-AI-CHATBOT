const { GoogleGenerativeAI } = require('@google/generative-ai');

class GoogleLLMService {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Initialize Google LLM with API key
            const apiKey = process.env.GOOGLE_LLM_API_KEY;
            if (!apiKey) {
                console.log('⚠️ Google LLM API key not found, service will be disabled');
                return;
            }

            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
            this.isInitialized = true;
            console.log('✅ Google LLM service initialized successfully');
        } catch (error) {
            console.error('❌ Google LLM initialization error:', error.message);
        }
    }

    async getHealthResponse(userMessage, detectedLanguage = 'en') {
        if (!this.isInitialized || !this.model) {
            console.log('⚠️ Google LLM service not available, using fallback');
            return this.getSmartHealthFallback(userMessage, detectedLanguage);
        }

        try {
            // Create language-specific prompt for training the LLM
            const languagePrompts = {
                'en': 'English',
                'hi': 'Hindi (हिंदी)',
                'or': 'Oriya/Odia (ଓଡ଼ିଆ)'
            };

            const targetLanguage = languagePrompts[detectedLanguage] || 'English';
            
            const prompt = `You are a trained health assistant LLM. Answer the following health question in ${targetLanguage} language only. 

Training Guidelines:
- Give concise, accurate health information (2-3 sentences max)
- If it's a serious condition, advise consulting a doctor
- Stay focused on the specific question asked
- Use simple, clear language appropriate for general public
- Only respond in ${targetLanguage}
- Base responses on established medical knowledge

Question: "${userMessage}"

Trained Response:`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text && text.trim().length > 0) {
                console.log(`✅ Google LLM response generated in ${targetLanguage}`);
                return text.trim();
            } else {
                throw new Error('Empty response from Google LLM');
            }

        } catch (error) {
            console.error('❌ Google LLM API error:', error.message);
            return this.getSmartHealthFallback(userMessage, detectedLanguage);
        }
    }

    // Enhanced fallback with more health topics
    getSmartHealthFallback(message, language = 'en') {
        const healthResponses = {
            'en': {
                'headache': 'Common headache causes include stress, dehydration, lack of sleep, or eye strain. Try rest, hydration, and gentle massage. Consult a doctor if severe or persistent.',
                'fever': 'Fever is often a sign of infection. Rest, drink fluids, and use fever reducers if needed. See a doctor if fever exceeds 103°F (39.4°C) or lasts more than 3 days.',
                'cough': 'Cough can be due to cold, allergies, or irritation. Stay hydrated, use honey, and avoid irritants. Consult a doctor if persistent or with blood.',
                'stomach': 'Stomach pain can have many causes. Try bland foods, stay hydrated, and rest. See a doctor if severe, persistent, or with other concerning symptoms.',
                'back pain': 'Back pain is often due to poor posture, strain, or stress. Try gentle stretching, heat/cold therapy, and maintain good posture. Consult a doctor if severe.',
                'fatigue': 'Fatigue can be due to lack of sleep, stress, poor diet, or underlying conditions. Ensure adequate rest, balanced nutrition, and regular exercise.',
                'default': 'For specific health concerns, it\'s always best to consult with a qualified healthcare professional who can provide personalized advice based on your situation.'
            },
            'hi': {
                'headache': 'सिरदर्द के सामान्य कारणों में तनाव, निर्जलीकरण, नींद की कमी या आंखों का तनाव शामिल है। आराम, पानी पीना और हल्की मालिश करें। गंभीर या लगातार होने पर डॉक्टर से मिलें।',
                'fever': 'बुखार अक्सर संक्रमण का संकेत है। आराम करें, तरल पदार्थ पीएं और जरूरत पड़ने पर बुखार कम करने वाली दवा लें। 103°F से अधिक या 3 दिन से ज्यादा रहने पर डॉक्टर को दिखाएं।',
                'cough': 'खांसी सर्दी, एलर्जी या जलन के कारण हो सकती है। पानी पीते रहें, शहद का उपयोग करें और परेशान करने वाली चीजों से बचें। लगातार या खून के साथ होने पर डॉक्टर से मिलें।',
                'stomach': 'पेट दर्द के कई कारण हो सकते हैं। हल्का भोजन लें, पानी पीते रहें और आराम करें। गंभीर, लगातार या अन्य चिंताजनक लक्षणों के साथ होने पर डॉक्टर को दिखाएं।',
                'back pain': 'कमर दर्द अक्सर गलत मुद्रा, तनाव या चोट के कारण होता है। हल्की स्ट्रेचिंग, गर्म/ठंडी सिकाई करें और सही मुद्रा बनाए रखें। गंभीर होने पर डॉक्टर से मिलें।',
                'fatigue': 'थकान नींद की कमी, तनाव, खराब आहार या अंतर्निहित स्थितियों के कारण हो सकती है। पर्याप्त आराम, संतुलित पोषण और नियमित व्यायाम सुनिश्चित करें।',
                'default': 'विशिष्ट स्वास्थ्य समस्याओं के लिए हमेशा एक योग्य स्वास्थ्य पेशेवर से सलाह लेना सबसे अच्छा है जो आपकी स्थिति के आधार पर व्यक्तिगत सलाह दे सकता है।'
            },
            'or': {
                'headache': 'ମୁଣ୍ଡବିନ୍ଧାର ସାଧାରଣ କାରଣରେ ଚାପ, ପାଣି ଅଭାବ, ନିଦ ଅଭାବ କିମ୍ବା ଆଖି ଚାପ ଅନ୍ତର୍ଭୁକ୍ତ। ବିଶ୍ରାମ, ପାଣି ପିଇବା ଏବଂ ହାଲକା ମାଲିସ କରନ୍ତୁ। ଗମ୍ଭୀର କିମ୍ବା ନିରନ୍ତର ହେଲେ ଡାକ୍ତରଙ୍କ ସହିତ ମିଳନ୍ତୁ।',
                'fever': 'ଜ୍ୱର ପ୍ରାୟତଃ ସଂକ୍ରମଣର ସଙ୍କେତ। ବିଶ୍ରାମ କରନ୍ତୁ, ତରଳ ପଦାର୍ଥ ପିଅନ୍ତୁ ଏବଂ ଆବଶ୍ୟକ ହେଲେ ଜ୍ୱର କମାଇବା ଔଷଧ ନିଅନ୍ତୁ। 103°F ରୁ ଅଧିକ କିମ୍ବା 3 ଦିନରୁ ଅଧିକ ରହିଲେ ଡାକ୍ତରଙ୍କୁ ଦେଖାନ୍ତୁ।',
                'cough': 'କାଶ ଥଣ୍ଡା, ଆଲର୍ଜି କିମ୍ବା ଜଳନ କାରଣରୁ ହୋଇପାରେ। ପାଣି ପିଇବା ଜାରି ରଖନ୍ତୁ, ମହୁ ବ୍ୟବହାର କରନ୍ତୁ ଏବଂ ଜ୍ୱାଲାମୟ ଜିନିଷରୁ ଦୂରେ ରୁହନ୍ତୁ। ନିରନ୍ତର କିମ୍ବା ରକ୍ତ ସହିତ ହେଲେ ଡାକ୍ତରଙ୍କ ସହିତ ମିଳନ୍ତୁ।',
                'stomach': 'ପେଟ ଯନ୍ତ୍ରଣାର ଅନେକ କାରଣ ହୋଇପାରେ। ହାଲୁକା ଖାଦ୍ୟ ଖାଆନ୍ତୁ, ପାଣି ପିଇବା ଜାରି ରଖନ୍ତୁ ଏବଂ ବିଶ୍ରାମ କରନ୍ତୁ। ଗମ୍ଭୀର, ନିରନ୍ତର କିମ୍ବା ଅନ୍ୟ ଚିନ୍ତାଜନକ ଲକ୍ଷଣ ସହିତ ହେଲେ ଡାକ୍ତରଙ୍କୁ ଦେଖାନ୍ତୁ।',
                'back pain': 'ପିଠି ଯନ୍ତ୍ରଣା ପ୍ରାୟତଃ ଭୁଲ ମୁଦ୍ରା, ଚାପ କିମ୍ବା ଆଘାତ କାରଣରୁ ହୁଏ। ହାଲୁକା ଷ୍ଟ୍ରେଚିଂ, ଗରମ/ଥଣ୍ଡା ସେକ କରନ୍ତୁ ଏବଂ ସଠିକ୍ ମୁଦ୍ରା ବଜାୟ ରଖନ୍ତୁ। ଗମ୍ଭୀର ହେଲେ ଡାକ୍ତରଙ୍କ ସହିତ ମିଳନ୍ତୁ।',
                'fatigue': 'କ୍ଲାନ୍ତି ନିଦ ଅଭାବ, ଚାପ, ଖରାପ ଖାଦ୍ୟ କିମ୍ବା ଅନ୍ତର୍ନିହିତ ସ୍ଥିତି କାରଣରୁ ହୋଇପାରେ। ପର୍ଯ୍ୟାପ୍ତ ବିଶ୍ରାମ, ସନ୍ତୁଳିତ ପୋଷଣ ଏବଂ ନିୟମିତ ବ୍ୟାୟାମ ନିଶ୍ଚିତ କରନ୍ତୁ।',
                'default': 'ନିର୍ଦ୍ଦିଷ୍ଟ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା ପାଇଁ ସର୍ବଦା ଜଣେ ଯୋଗ୍ୟ ସ୍ୱାସ୍ଥ୍ୟ ପେଶାଦାରଙ୍କ ସହିତ ପରାମର୍ଶ କରିବା ସର୍ବୋତ୍ତମ ଯିଏ ଆପଣଙ୍କ ସ୍ଥିତି ଆଧାରରେ ବ୍ୟକ୍ତିଗତ ପରାମର୍ଶ ଦେଇପାରିବେ।'
            }
        };

        const responses = healthResponses[language] || healthResponses['en'];
        const lowerMessage = message.toLowerCase();

        // Find matching keyword
        for (const [keyword, response] of Object.entries(responses)) {
            if (keyword !== 'default' && lowerMessage.includes(keyword)) {
                console.log(`✅ Smart health fallback matched: ${keyword} in ${language}`);
                return response;
            }
        }

        console.log(`✅ Using default health fallback in ${language}`);
        return responses['default'];
    }

    // Health check method
    isAvailable() {
        return this.isInitialized && this.model !== null;
    }
}

module.exports = new GoogleLLMService();