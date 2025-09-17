# 🏥 WhatsApp Health Chatbot with AI

A simple WhatsApp chatbot built with Node.js and Twilio that educates users on basic health topics and sends daily outbreak alerts. The bot supports English, Hindi, and Oriya languages, has a built-in LLM for intelligent responses, and can be easily trained by editing JSON files.

## 🌟 Features

- **Health Q&A**: Responds to 10+ common health questions (flu, dengue, malaria, diabetes, vaccines, etc.)
- **Advanced Google LLM**: Uses Google's trained AI model for intelligent, accurate health responses in all languages
- **Multi-LLM Architecture**: Google LLM primary + Hugging Face LLM fallback for maximum reliability
- **Trilingual Support**: English, Hindi, and Oriya languages with native AI responses
- **Smart Training**: JSON knowledge base + AI learning for comprehensive health coverage
- **Robust Response System**: Always provides helpful answers, even for complex or unusual questions
- **Daily Alerts**: Sends health outbreak alerts at 9 AM IST daily
- **Facebook Business WhatsApp**: Official WhatsApp Business API (no daily limits!)
- **Production Ready**: Deployed and tested with multiple AI fallback layers

## 📋 Health Topics Covered

1. **Flu/Influenza** - Symptoms and prevention
2. **Dengue Fever** - Symptoms and precautions
3. **Malaria** - Symptoms and prevention
4. **Diabetes** - Symptoms and prevention
5. **Hypertension** - High blood pressure info
6. **COVID-19** - Symptoms and precautions
7. **Tuberculosis** - Symptoms and treatment info
8. **Vaccination Schedule** - Basic immunization schedule
9. **Diarrhea/Food Poisoning** - Treatment and prevention
10. **Anemia** - Iron deficiency symptoms and prevention

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **Twilio Account** - [Sign up free](https://www.twilio.com/try-twilio)
- **Git** (optional) - [Download here](https://git-scm.com/)

### 1. Setup Project

```bash
# Clone or download this project
git clone <repository-url>
cd whatsapp-health-chatbot

# Or if you downloaded the ZIP file, extract it and navigate to the folder
cd whatsapp-health-chatbot

# Install dependencies
npm install
```

### 2. Configure Twilio

#### Step 1: Create Twilio Account
1. Go to [Twilio](https://www.twilio.com/try-twilio) and sign up for a free account
2. Verify your phone number
3. Go to [Twilio Console](https://console.twilio.com/)

#### Step 2: Get Twilio Credentials
1. In Twilio Console, note down:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click the eye icon to reveal)

#### Step 3: Setup WhatsApp Sandbox
1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to join the WhatsApp Sandbox
3. Note the **WhatsApp number** (format: whatsapp:+14155238886)

### 3. Configure Environment Variables

#### For Local Development:
Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` file with your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Optional AI Keys (for enhanced responses)
# Google LLM API (recommended - get at https://ai.google.dev/gemini-api/docs/api-key)
GOOGLE_LLM_API_KEY=your_google_api_key_here

# Hugging Face API (fallback - get at https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

PORT=3000
```

**🚀 AI Enhancement:**
- **Google LLM API Key** (recommended): Provides the most robust, accurate health responses in all languages
- **Hugging Face API Key** (optional): Serves as backup AI when Google LLM is unavailable
- **Without AI keys**: Bot still works perfectly using the JSON knowledge base

### 4. Test Locally

```bash
# Start the server
npm start

# The server will start on http://localhost:3000
# You should see: "🚀 WhatsApp Health Chatbot started successfully!"
```

### 5. Setup Webhook (for local testing)

To test locally, you need to expose your local server to the internet. Use [ngrok](https://ngrok.com/):

```bash
# Install ngrok globally
npm install -g ngrok

# In a new terminal, expose your local server
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

Configure webhook in Twilio:
1. Go to **Messaging** → **Settings** → **WhatsApp sandbox settings**
2. Set webhook URL: `https://your-ngrok-url.ngrok.io/webhook`
3. Save configuration

### 6. Test the Bot

1. Send "join [your-sandbox-keyword]" to your Twilio WhatsApp number
2. Try these test messages:
   - "flu symptoms"
   - "डेंगू के लक्षण" (dengue symptoms in Hindi)
   - "vaccine schedule"
   - "diabetes prevention"

## 🌐 Deploy to Heroku

### Step 1: Create Heroku Account
1. Sign up at [Heroku](https://signup.heroku.com/)
2. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

### Step 2: Deploy

```bash
# Login to Heroku
heroku login

# Create new Heroku app
heroku create your-app-name

# Set environment variables on Heroku
heroku config:set TWILIO_ACCOUNT_SID=your_account_sid
heroku config:set TWILIO_AUTH_TOKEN=your_auth_token
heroku config:set TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Deploy to Heroku
git init
git add .
git commit -m "Initial commit"
git push heroku main

# Open your app
heroku open
```

### Step 3: Configure Production Webhook

1. Go to Twilio Console → **Messaging** → **WhatsApp sandbox settings**
2. Set webhook URL: `https://your-app-name.herokuapp.com/webhook`
3. Save configuration

## 🎯 How to Train the Bot

The bot has two training methods: **Simple JSON training** (no coding required) and **AI Training** (for advanced responses).

### Method 1: Simple JSON Training

Edit `healthData.json` and add new questions to the `questions` array:

```json
{
  "keywords": ["headache", "migraine", "सिरदर्द", "ମୁଣ୍ଡବିନ୍ଧା"],
  "response": {
    "en": "Headaches can be caused by stress, dehydration, or lack of sleep. Rest in a dark room and stay hydrated.",
    "hi": "सिरदर्द तनाव, निर्जलीकरण या नींद की कमी के कारण हो सकता है। अंधेरे कमरे में आराम करें और पानी पिएं।",
    "or": "ମୁଣ୍ଡବିନ୍ଧା ଚାପ, ନିର୍ଜଳୀକରଣ କିମ୍ବା ନିଦ୍ରା ଅଭାବ କାରଣରୁ ହୋଇପାରେ। ଅନ୍ଧାର କୋଠରୀରେ ବିଶ୍ରାମ କରନ୍ତୁ ଏବଂ ହାଇଡ୍ରେଟେଡ ରୁହନ୍ତୁ।"
  }
}
```

### Method 2: AI Training (Advanced)

The bot learns from interactions automatically. You can also manually add training examples to `trainingData.json`:

```json
{
  "input": "what causes stomach pain",
  "output": "Stomach pain can be caused by indigestion, gas, overeating, or food poisoning. Eat light foods and drink water. See a doctor if pain persists for more than 24 hours.",
  "language": "en",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**How AI Training Works:**
1. **Automatic Learning**: When users interact with the bot, successful responses are automatically saved
2. **Manual Training**: Add examples to `trainingData.json` for specific health topics
3. **Fallback Logic**: Bot tries JSON first, then AI, then default response

### Adding New Alert Messages

Add new alerts to the `alerts` array in `healthData.json`:

Add new alerts to the `alerts` array:

```json
{
  "message": {
    "en": "🚨 Health Alert: Monsoon season - Prevent waterborne diseases by drinking clean water.",
    "hi": "🚨 स्वास्थ्य चेतावनी: मानसून का मौसम - साफ पानी पीकर जल जनित रोगों से बचें।",
    "or": "🚨 ସ୍ୱାସ୍ଥ୍ୟ ସତର୍କତା: ବର୍ଷା ଋତୁ - ପରିଷ୍କାର ପାଣି ପିଇ ଜଳଜନିତ ରୋଗରୁ ରକ୍ଷା ପାଆନ୍ତୁ।"
  }
}
```

### Training Tips

1. **Use Training Helper**: Run `npm run train` for easy interactive training
2. **Keywords**: Add multiple variations of keywords users might type  
3. **Language**: Always provide English, Hindi, and Oriya responses
4. **AI Learning**: The bot automatically learns from successful interactions
5. **Testing**: Test new additions by messaging the bot
6. **Restart**: Restart the server after editing JSON files

### Quick Training Commands
```bash
# Interactive training tool
npm run train

# Start training helper directly  
node train.js
```

## 📱 Example Interactions

### English Interactions
```
User: "What are flu symptoms?"
Bot: "Flu symptoms include fever, cough, sore throat, body aches, headache, and fatigue. Visit a doctor if symptoms are severe or last more than a week."

User: "vaccine schedule"
Bot: "Basic vaccine schedule: Birth (BCG, Hepatitis B), 6 weeks (DPT, Polio, Hib)..."
```

### Hindi Interactions
```
User: "डेंगू के लक्षण?"
Bot: "डेंगू के लक्षणों में तेज बुखार, गंभीर सिरदर्द, मांसपेशियों में दर्द, जोड़ों में दर्द और त्वचा पर चकत्ते शामिल हैं।"

User: "मलेरिया की रोकथाम"
Bot: "मलेरिया के लक्षणों में बुखार, ठंड लगना, सिरदर्द, मतली और उल्टी शामिल हैं।"
```

### Oriya Interactions
```
User: "ଡେଙ୍ଗୁ ଲକ୍ଷଣ?"
Bot: "ଡେଙ୍ଗୁର ଲକ୍ଷଣରେ ଉଚ୍ଚ ଜ୍ୱର, ପ୍ରବଳ ମୁଣ୍ଡବିନ୍ଧା, ମାଂସପେଶୀ ଯନ୍ତ୍ରଣା, ଗଣ୍ଠି ଯନ୍ତ୍ରଣା ଏବଂ ଚର୍ମରେ ଦାଗ ଅନ୍ତର୍ଭୁକ୍ତ।"

User: "ଫ୍ଲୁ ଲକ୍ଷଣ"
Bot: "ଫ୍ଲୁର ଲକ୍ଷଣରେ ଜ୍ୱର, କାଶ, ଗଳା ଯନ୍ତ୍ରଣା, ଶରୀର ଯନ୍ତ୍ରଣା, ମୁଣ୍ଡବିନ୍ଧା ଏବଂ କ୍ଲାନ୍ତି ଅନ୍ତର୍ଭୁକ୍ତ।"
```

### Daily Alerts
Every day at 9:00 AM IST, the bot sends alerts like:
```
"🚨 Health Alert: Dengue outbreak reported in Odisha. Use mosquito repellent, wear long sleeves, and eliminate standing water. Stay safe!"
```

## 🔧 Technical Details

### Project Structure
```
whatsapp-health-chatbot/
├── index.js              # Main server file with webhook logic
├── llmService.js         # AI/LLM service for intelligent responses  
├── healthData.json       # Health Q&A and alerts data (JSON training)
├── trainingData.json     # AI training examples and conversations
├── package.json          # Dependencies and scripts
├── Procfile              # Heroku deployment config
├── .env.example          # Environment variables template
└── README.md             # This file
```

### Dependencies
- **express**: Web server framework
- **twilio**: WhatsApp messaging via Twilio
- **node-schedule**: Daily alert scheduling
- **body-parser**: Parse webhook data
- **@huggingface/inference**: AI/LLM responses via Hugging Face
- **natural**: Natural language processing utilities

### Key Functions
- `detectLanguage()`: Detects Hindi/Oriya/English from user input
- `findHealthResponse()`: Matches user queries to health data
- `sendWhatsAppMessage()`: Sends messages via Twilio
- `sendDailyAlerts()`: Broadcasts daily health alerts

## 🛠️ Troubleshooting

### Common Issues

1. **"Cannot find module" error**
   ```bash
   npm install
   ```

2. **Webhook not receiving messages**
   - Check if webhook URL is correct in Twilio console
   - Ensure HTTPS URL is used (not HTTP)
   - Verify the app is running and accessible

3. **Messages not sending**
   - Verify Twilio credentials are correct
   - Check if you've joined the WhatsApp sandbox
   - Ensure your Twilio account has sufficient balance

4. **Bot not responding correctly**
   - Check if `healthData.json` is valid JSON
   - Restart the server after making changes
   - Test with exact keywords from the JSON file

5. **Daily alerts not working**
   - Check server logs for scheduling errors
   - Verify timezone settings (alerts are scheduled for IST)
   - Ensure at least one user has messaged the bot

### Debugging

Enable detailed logging by checking the console output:
```bash
npm start
# Watch for log messages starting with 📥, 💬, 🤖, etc.
```

## 📊 Monitoring

### Health Check
Visit `https://your-app-name.herokuapp.com/health` to see:
- Bot status
- Number of registered users
- Server uptime

### Logs
View Heroku logs:
```bash
heroku logs --tail
```

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your Twilio credentials secure
- Use environment variables for sensitive data
- Regularly rotate your Twilio Auth Token

## 📈 Scaling & Improvements

### For Production Use:
1. **Database**: Replace user contact storage with a database (MongoDB/PostgreSQL)
2. **Analytics**: Add user interaction tracking
3. **Rate Limiting**: Implement rate limiting for webhook endpoint
4. **Language Detection**: Improve language detection with ML models
5. **NLP**: Add natural language processing for better query matching
6. **Authentication**: Add webhook signature verification

### Performance Optimization:
1. **Caching**: Cache health data in memory
2. **Load Balancing**: Use multiple Heroku dynos
3. **CDN**: Serve static content via CDN

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Twilio documentation
3. Check server logs for error messages
4. Ensure all environment variables are set correctly

## 📚 Additional Resources

- [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Express.js Documentation](https://expressjs.com/)

---

**Happy Coding! 🚀** Build something amazing and help make healthcare information more accessible!