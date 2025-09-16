# 🚀 WhatsApp Health Chatbot - Deployment Guide

## Quick Deployment Steps

### 1. Prerequisites
- [Heroku Account](https://signup.heroku.com/) (free)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- Git installed

### 2. Deploy to Heroku

#### Step 1: Login to Heroku
```bash
heroku login
```

#### Step 2: Create Heroku App
```bash
heroku create your-health-chatbot-name
```
*Replace `your-health-chatbot-name` with a unique name*

#### Step 3: Set Environment Variables
```bash
heroku config:set TWILIO_ACCOUNT_SID=ACe8a3412c41a2243b86d504b61dd13249
heroku config:set TWILIO_AUTH_TOKEN=6f207ddb561dd3efbd8c860ccd186107
heroku config:set TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
heroku config:set HUGGINGFACE_API_KEY=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
```

#### Step 4: Deploy
```bash
git add .
git commit -m "Deploy WhatsApp Health Chatbot"
git push heroku main
```

#### Step 5: Update Twilio Webhook
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to Messaging → Settings → WhatsApp Sandbox
3. Update webhook URL to: `https://your-app-name.herokuapp.com/webhook`
4. Set method to POST
5. Click Save

### 3. Alternative: One-Click Deploy

Click this button to deploy instantly:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### 4. Test Your Deployed Bot

1. **Get your app URL**: `https://your-app-name.herokuapp.com`
2. **Check if it's running**: Visit the URL in browser
3. **Test webhook**: Send WhatsApp message to your Twilio number
4. **Check logs**: `heroku logs --tail` to see real-time logs

### 5. Production Checklist

- ✅ Heroku app created and deployed
- ✅ Environment variables set
- ✅ Twilio webhook updated
- ✅ WhatsApp messages working
- ✅ All 3 languages responding correctly
- ✅ LLM fallback working
- ✅ Daily alerts scheduled

## 🔧 Troubleshooting

### Common Issues:

1. **App not responding**:
   ```bash
   heroku logs --tail
   heroku ps:scale web=1
   ```

2. **Webhook errors**:
   - Verify webhook URL ends with `/webhook`
   - Check Twilio credentials are correct
   - Ensure method is POST

3. **Environment variables**:
   ```bash
   heroku config
   ```

4. **App crashes**:
   ```bash
   heroku restart
   ```

## 📱 Usage After Deployment

Your bot is now live! Users can:

1. **Send health queries** in English, Hindi, or Oriya
2. **Get instant responses** for 11+ health topics
3. **Receive AI-powered answers** for complex questions
4. **Get daily health alerts** at 9 AM IST

### Example Queries:
- "flu symptoms" / "फ्लू के लक्षण" / "ଫ୍ଲୁ ଲକ୍ଷଣ"
- "what causes back pain"
- "dengue prevention"
- "diabetes symptoms"

## 🎯 Next Steps

1. **Monitor usage**: `heroku logs --tail`
2. **Add more health topics**: Edit `healthData.json` and redeploy
3. **Train the AI**: Use `npm run train` locally, then redeploy
4. **Scale if needed**: `heroku ps:scale web=2` for more traffic

Your WhatsApp Health Chatbot is now deployed and ready to help users with health information! 🏥✨