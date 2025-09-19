# Arogyam AI - WhatsApp Health Chatbot 🏥🤖

> **Advanced health assistant powered by custom-trained AI for WhatsApp Business**

![Arogyam AI](https://img.shields.io/badge/Arogyam-AI%20Health%20Assistant-green)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Business%20API-25D366)
![Custom AI](https://img.shields.io/badge/Custom-DistilGPT2%20Model-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)

## 🎯 **Project Overview**

**Arogyam AI** is an intelligent WhatsApp chatbot specifically designed for health education and medical guidance. It features a **custom-trained lightweight AI model** that provides specialized health responses while maintaining fast performance and reliable operation.

### ✨ **Key Features**

- 🤖 **Custom AI Model**: Fine-tuned DistilBERT2 specialized for health queries
- 📱 **WhatsApp Integration**: Native Facebook Business WhatsApp API
- 🌍 **Multi-language Support**: English, Hindi, and Oriya
- 📊 **Admin Dashboard**: Real-time analytics and user management
- 🔄 **Easy Model Updates**: Simple retraining process
- ⚡ **Fast & Lightweight**: Optimized for quick responses
- 🛡️ **Reliable Fallbacks**: Graceful degradation system

## 🏗️ **Architecture**

### **AI Response System**
```
User Message → Language Detection → JSON Knowledge Base → Custom Arogyam AI Model → Response
                                                      ↓ (if fails)
                                               Simple Fallback → Response
```

### **Core Components**
- **Custom LLM Service**: `YuvrajUdaywal/arogyam-ai-health-chatbot` (Hugging Face)
- **Facebook Service**: WhatsApp Business API integration
- **Health Database**: Local JSON knowledge base for instant responses
- **Dashboard**: Real-time monitoring and analytics

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Python 3.8+ (for model training)
- Facebook Business WhatsApp API access
- Hugging Face account

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/ciphervaishnavi/SIH-WHATSAPP-AI-CHATBOT.git
cd SIH-WHATSAPP-AI-CHATBOT
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Start the application**
```bash
npm start
```

### **Environment Variables**

```env
# Facebook WhatsApp Business API
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_PHONE_NUMBER_ID=your_phone_number_id
FACEBOOK_VERIFY_TOKEN=your_verify_token
FACEBOOK_APP_SECRET=your_app_secret

# Custom Arogyam AI Model (Hugging Face)
HF_API_TOKEN=your_huggingface_api_token
HF_CUSTOM_MODEL_ID=YuvrajUdaywal/arogyam-ai-health-chatbot

# Application Configuration
JWT_SECRET=your_jwt_secret
PORT=3000
```

## 🧠 **Custom AI Model**

### **Model Details**
- **Base Model**: DistilGPT2 (lightweight, fast)
- **Specialization**: Health and medical queries
- **Training Data**: 47+ health Q&A pairs
- **Deployment**: Hugging Face Hub
- **Performance**: ~500ms response time

### **Model Training**

To train or update the model:

```bash
# 1. Update training data
# Edit train.csv with new health Q&A pairs

# 2. Install Python dependencies
pip install torch transformers datasets huggingface_hub accelerate

# 3. Train the model
python train.py

# 4. Model automatically deploys to Hugging Face
# Bot uses the updated model immediately
```

### **Training Data Format**
```csv
prompt,response
"What is fever?","Fever is when your body temperature rises above normal..."
"How to treat diabetes?","Manage diabetes through regular monitoring..."
```

## 📱 **WhatsApp Integration**

### **Setup Steps**
1. **Facebook Business Account**: Create and verify
2. **WhatsApp Business**: Set up business profile
3. **Webhook Configuration**: Point to your deployed URL
4. **Phone Number**: Configure and verify

### **Webhook URL**
```
https://your-app-url.com/webhook
```

## 🎛️ **Dashboard Features**

Access the admin dashboard at `http://localhost:3000/`:

- 📊 **Real-time Analytics**: Message statistics and user engagement
- 👥 **User Management**: View registered users and activity
- 📈 **Performance Metrics**: Response times and model usage
- 🔧 **System Status**: Service health and availability
- 📋 **Message Logs**: Conversation history and debugging

## 🛠️ **Deployment**

### **Render.com (Recommended)**
```bash
# Automatic deployment with render.yaml
# Connect your GitHub repo to Render
# Set environment variables in Render dashboard
```

### **Vercel/Netlify**
```bash
# Push to GitHub
# Import project to Vercel/Netlify
# Configure environment variables
# Deploy
```

### **Docker**
```bash
docker build -t arogyam-ai .
docker run -p 3000:3000 arogyam-ai
```

## 📚 **Health Topics Covered**

- 🦠 **Infectious Diseases**: Fever, dengue, malaria, COVID-19, tuberculosis
- 💉 **Chronic Conditions**: Diabetes, hypertension, asthma, arthritis
- 🧠 **Mental Health**: Depression, anxiety, stress management
- ❤️ **Cardiovascular**: Heart disease, stroke prevention
- 🏥 **Emergency Care**: First aid, when to see a doctor
- 💊 **Prevention**: Vaccination, hygiene, lifestyle tips

## 🔄 **Model Updates**

### **Easy Retraining Process**
1. Add new health Q&A pairs to `train.csv`
2. Run `python train.py`
3. Model automatically updates on Hugging Face
4. Bot uses improved model immediately

### **Version Management**
- Models are versioned on Hugging Face Hub
- Easy rollback to previous versions
- A/B testing capabilities

## 🌍 **Multi-language Support**

- **English**: Primary language with full AI support
- **Hindi**: Supported via custom responses
- **Oriya**: Regional language support
- **Expandable**: Easy to add new languages

## 🛡️ **Reliability Features**

### **Graceful Fallbacks**
1. **Custom AI Model** → Primary health specialist
2. **JSON Knowledge Base** → Instant predefined responses
3. **Simple Fallback** → Apologetic message if all fail

### **Error Handling**
- Automatic retry logic
- Detailed error logging
- Service availability monitoring
- Graceful degradation

## 📊 **Performance**

- **Response Time**: <1 second average
- **Availability**: 99.9% uptime target
- **Throughput**: Handles concurrent users efficiently
- **Model Size**: Lightweight 328MB DistilGPT2

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Setup**
```bash
# Clone and install dependencies
git clone <repo-url>
cd SIH-WHATSAPP-AI-CHATBOT
npm install

# Install Python dependencies for model training
pip install -r requirements.txt

# Start development server
npm run dev
```

## 📋 **API Endpoints**

- `GET /` - Admin dashboard
- `POST /webhook` - WhatsApp webhook receiver
- `GET /webhook` - Webhook verification
- `POST /api/login` - Dashboard authentication
- `GET /api/stats` - Usage statistics
- `GET /api/users` - User management

## 🔐 **Security**

- Environment variable encryption
- JWT-based authentication
- Facebook webhook signature verification
- Input sanitization and validation
- Rate limiting and abuse protection

## 📞 **Support**

- **Documentation**: Check our [Technical Guide](README_TECHNICAL.md)
- **Issues**: Create a GitHub issue
- **Deployment**: See [Deployment Guide](DEPLOYMENT.md)
- **Facebook Setup**: See [Facebook API Setup](FACEBOOK_API_SETUP.md)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Hugging Face**: For model hosting and inference
- **Facebook**: For WhatsApp Business API
- **DistilGPT2**: For the lightweight base model
- **SIH**: For the innovation opportunity

---

**Built with ❤️ for better healthcare accessibility through AI**

> **Arogyam AI** - Making health information accessible to everyone, everywhere, in any language.
