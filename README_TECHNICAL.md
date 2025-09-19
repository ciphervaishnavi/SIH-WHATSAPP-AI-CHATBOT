# Arogyam AI - Technical Documentation 🛠️

## 🏗️ **System Architecture**

### **Overview**
Arogyam AI is built with a streamlined architecture focused on reliability, performance, and ease of maintenance. The system uses a custom-trained AI model as the primary intelligence layer with graceful fallbacks.

### **Core Architecture**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   Facebook       │    │   Node.js       │
│   Business      │◄──►│   Webhook        │◄──►│   Application   │
│   User          │    │   Receiver       │    │   Server        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Response       │
                                               │  Processing     │
                                               │  Pipeline       │
                                               └─────────────────┘
                                                        │
                       ┌────────────────────────────────┼────────────────────────────────┐
                       ▼                                ▼                                ▼
              ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
              │ JSON Knowledge  │              │ Custom Arogyam  │              │ Simple Fallback │
              │ Base (Instant)  │              │ AI Model (HF)   │              │ Message         │
              └─────────────────┘              └─────────────────┘              └─────────────────┘
```

## 🤖 **AI Model Integration**

### **Custom Model Architecture**
- **Base Model**: DistilGPT2 (82M parameters)
- **Fine-tuning**: Health-specific Q&A dataset
- **Deployment**: Hugging Face Hub (`YuvrajUdaywal/arogyam-ai-health-chatbot`)
- **Inference**: Hugging Face Inference API
- **Performance**: ~500ms response time

### **Model Service (customLLMService.js)**
```javascript
class ArogyamCustomLLMService {
    constructor() {
        this.apiToken = process.env.HF_API_TOKEN;
        this.modelId = process.env.HF_CUSTOM_MODEL_ID;
        this.apiUrl = `https://api-inference.huggingface.co/models/${this.modelId}`;
    }

    async getHealthResponse(query, language = 'en') {
        // Format prompt for health context
        const prompt = `User: ${query}\nBot: `;
        
        // Call Hugging Face Inference API
        const response = await this.callHuggingFaceAPI(prompt);
        
        // Post-process and clean response
        return this.cleanResponse(response, query);
    }
}
```

### **Response Processing Pipeline**
1. **Language Detection**: Detect user's language (English, Hindi, Oriya)
2. **JSON Lookup**: Check predefined health responses for instant answers
3. **Custom AI Model**: Query fine-tuned model for specialized responses
4. **Fallback**: Simple error message if all systems fail

## 📊 **Data Flow**

### **Request Flow**
```
WhatsApp Message → Facebook Webhook → Express.js Router → Message Processor
                                                              │
                                                              ▼
Language Detection → JSON Knowledge Base → Custom AI Model → Response
                                    │               │
                                    ▼               ▼
                              Instant Answer   AI Generated Answer
                                    │               │
                                    └───────┬───────┘
                                            ▼
                                    Format & Send via Facebook API
```

### **Database Schema**
```javascript
// users.json
{
  "users": [
    {
      "id": "unique_id",
      "phone": "+1234567890",
      "name": "User Name",
      "registeredAt": "2025-01-01T00:00:00Z",
      "lastActive": "2025-01-01T12:00:00Z"
    }
  ],
  "registeredNumbers": ["+1234567890"],
  "userStats": {
    "totalUsers": 1,
    "activeToday": 1,
    "totalMessages": 10
  }
}

// healthData.json
{
  "health_topics": {
    "fever": {
      "keywords": ["fever", "temperature", "bukhar"],
      "responses": {
        "en": "Fever is when your body temperature rises...",
        "hi": "बुखार तब होता है जब...",
        "or": "ଜ୍ୱର ହେଉଛି..."
      }
    }
  }
}
```

## 🔧 **Core Services**

### **1. Facebook WhatsApp Service (facebookService.js)**
```javascript
class FacebookWhatsAppService {
    constructor() {
        this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
        this.phoneNumberId = process.env.FACEBOOK_PHONE_NUMBER_ID;
        this.verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
    }

    async sendMessage(to, message) {
        const url = `https://graph.facebook.com/v13.0/${this.phoneNumberId}/messages`;
        const payload = {
            messaging_product: "whatsapp",
            to: to,
            text: { body: message }
        };
        
        return await this.makeAPICall(url, payload);
    }

    verifyWebhook(mode, token, challenge) {
        if (mode === "subscribe" && token === this.verifyToken) {
            return challenge;
        }
        return null;
    }
}
```

### **2. Custom LLM Service (customLLMService.js)**
```javascript
class ArogyamCustomLLMService {
    constructor() {
        this.apiToken = process.env.HF_API_TOKEN;
        this.modelId = process.env.HF_CUSTOM_MODEL_ID;
        this.baseURL = 'https://api-inference.huggingface.co/models/';
    }

    isAvailable() {
        return !!(this.apiToken && this.modelId);
    }

    async getHealthResponse(query, language = 'en') {
        if (!this.isAvailable()) {
            throw new Error('Custom LLM service not configured');
        }

        const prompt = this.formatPrompt(query, language);
        const response = await this.callHuggingFaceAPI(prompt);
        
        return this.cleanResponse(response, query);
    }
}
```

### **3. Health Data Service**
```javascript
function findHealthResponse(text, language = 'en') {
    const normalizedText = text.toLowerCase();
    
    for (const [topic, data] of Object.entries(healthData.health_topics)) {
        if (data.keywords.some(keyword => 
            normalizedText.includes(keyword.toLowerCase())
        )) {
            return data.responses[language] || data.responses.en;
        }
    }
    
    return null;
}
```

## 🌐 **API Endpoints**

### **WhatsApp Webhook**
```
POST /webhook
- Receives WhatsApp messages
- Processes through AI pipeline
- Sends responses back to users

GET /webhook
- Webhook verification for Facebook
- Returns challenge for valid tokens
```

### **Dashboard API**
```
GET /
- Serves admin dashboard
- Real-time analytics display

POST /api/login
- JWT authentication
- Secure admin access

GET /api/stats
- Usage statistics
- Performance metrics

GET /api/users
- User management
- Registration data
```

## 🔐 **Security Implementation**

### **Authentication & Authorization**
```javascript
// JWT-based authentication
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}
```

### **Facebook Webhook Verification**
```javascript
function verifyWebhookSignature(req, res, next) {
    const signature = req.headers['x-hub-signature-256'];
    const expectedSignature = crypto
        .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');
    
    if (`sha256=${expectedSignature}` !== signature) {
        return res.status(400).send('Invalid signature');
    }
    
    next();
}
```

## 🚀 **Performance Optimization**

### **Response Time Optimization**
- **JSON Lookup**: O(1) instant responses for common queries
- **Model Caching**: Hugging Face model stays warm
- **Async Processing**: Non-blocking request handling
- **Connection Pooling**: Efficient HTTP request management

### **Memory Management**
```javascript
// Efficient data loading
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
```

### **Error Handling & Resilience**
```javascript
// Graceful degradation
async function processMessage(text, from) {
    let responseMessage = null;
    
    try {
        // Try JSON knowledge base first
        responseMessage = findHealthResponse(text, detectedLanguage);
        
        if (!responseMessage) {
            // Try custom AI model
            responseMessage = await customLLMService.getHealthResponse(text, detectedLanguage);
        }
    } catch (error) {
        console.error('AI processing error:', error);
    }
    
    // Fallback to simple message
    if (!responseMessage) {
        responseMessage = "I'm sorry, I'm currently unable to process your request.";
    }
    
    return responseMessage;
}
```

## 📈 **Monitoring & Analytics**

### **Performance Metrics**
- Response time tracking
- Success/failure rates
- Model usage statistics
- User engagement metrics

### **Logging System**
```javascript
// Structured logging
console.log(`🎯 Response from: ${responseSource}`);
console.log(`🤖 Bot response: ${responseMessage.substring(0, 150)}...`);
console.log(`⏱️ Processing time: ${Date.now() - startTime}ms`);
```

### **Health Checks**
```javascript
// Service availability monitoring
function healthCheck() {
    return {
        status: 'healthy',
        services: {
            facebook: facebookService.isConfigured(),
            customLLM: customLLMService.isAvailable(),
            database: !!healthData
        },
        timestamp: new Date().toISOString()
    };
}
```

## 🔄 **Model Training Pipeline**

### **Training Process**
```python
# train.py - Automated training pipeline
def train_model():
    # 1. Load and prepare data
    dataset = load_and_prepare_data()
    
    # 2. Setup model and tokenizer
    tokenizer, model = setup_tokenizer_and_model()
    
    # 3. Tokenize dataset
    tokenized_dataset = tokenize_dataset(dataset, tokenizer)
    
    # 4. Configure training
    training_args = setup_training_args()
    
    # 5. Train model
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        tokenizer=tokenizer
    )
    
    # 6. Execute training
    trainer.train()
    
    # 7. Save and upload
    trainer.push_to_hub()
    
    return trainer, tokenizer
```

### **Deployment Automation**
- Automatic model versioning
- Hugging Face Hub integration
- Zero-downtime model updates
- Rollback capabilities

## 🛠️ **Development Environment**

### **Local Setup**
```bash
# Install dependencies
npm install

# Python dependencies for training
pip install torch transformers datasets huggingface_hub accelerate

# Environment configuration
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

### **Testing**
```javascript
// Unit tests for core functions
const { findHealthResponse } = require('./index');

test('should find fever response', () => {
    const response = findHealthResponse('I have fever', 'en');
    expect(response).toContain('temperature');
});
```

## 🌍 **Multi-language Support**

### **Language Detection**
```javascript
function detectLanguage(text) {
    // Oriya (Odia script)
    const oriyaPattern = /[\u0B00-\u0B7F]/;
    if (oriyaPattern.test(text)) return 'or';
    
    // Hindi (Devanagari script)
    const hindiPattern = /[\u0900-\u097F]/;
    if (hindiPattern.test(text)) return 'hi';
    
    // Default to English
    return 'en';
}
```

### **Response Localization**
- JSON responses in multiple languages
- AI model supports English queries
- Fallback language handling
- Unicode support for all scripts

## 📦 **Deployment Architecture**

### **Production Environment**
```yaml
# render.yaml
services:
  - type: web
    name: arogyam-ai
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### **Environment Variables**
```bash
# Production environment
FACEBOOK_ACCESS_TOKEN=production_token
FACEBOOK_PHONE_NUMBER_ID=production_phone_id
HF_API_TOKEN=huggingface_token
HF_CUSTOM_MODEL_ID=YuvrajUdaywal/arogyam-ai-health-chatbot
JWT_SECRET=production_secret
PORT=3000
```

---

**This technical documentation covers the complete architecture and implementation details of the Arogyam AI WhatsApp Health Chatbot system.**