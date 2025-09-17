# 📱 Facebook Business WhatsApp API Setup Guide

## 🌟 Why Facebook Business API?

✅ **No daily message limits** (unlike Twilio's free tier)  
✅ **Official WhatsApp integration** (direct from Meta)  
✅ **Better reliability** and faster delivery  
✅ **Free to start** with generous limits  
✅ **No sandbox restrictions** for verified businesses  

---

## 🚀 Step-by-Step Setup

### Step 1: Create Meta App
1. Go to [Meta for Developers](https://developers.facebook.com)
2. Click **"Create App"**
3. Choose **"Business"** app type
4. Fill in app details and create

### Step 2: Add WhatsApp Product
1. In your app dashboard, click **"Add Product"**
2. Find **"WhatsApp"** and click **"Set up"**
3. You'll be taken to WhatsApp API setup

### Step 3: Get Your Credentials

#### 3.1 Access Token
- In WhatsApp > API Setup
- Copy the **Temporary Access Token**
- For production, generate a **Permanent Access Token**

#### 3.2 Phone Number ID
- In the **"From"** dropdown
- Copy the **Phone Number ID** (long number like `123456789012345`)

#### 3.3 Verify Token
- Create a custom string (e.g., `my_health_bot_verify_123`)
- You'll use this for webhook verification

#### 3.4 App Secret
- Go to App Settings > Basic
- Copy your **App Secret**

### Step 4: Set Environment Variables

Update your `.env` file:
```bash
FACEBOOK_ACCESS_TOKEN=your_access_token_here
FACEBOOK_PHONE_NUMBER_ID=123456789012345
FACEBOOK_VERIFY_TOKEN=my_health_bot_verify_123
FACEBOOK_APP_SECRET=your_app_secret_here
GOOGLE_LLM_API_KEY=your_google_api_key_here
```

### Step 5: Configure Webhook
1. In WhatsApp > Configuration
2. Set **Webhook URL**: `https://your-app.onrender.com/webhook`
3. Set **Verify Token**: `my_health_bot_verify_123` (same as in .env)
4. Subscribe to **messages** field
5. Click **Verify and Save**

### Step 6: Test Your Bot
1. In WhatsApp > API Setup
2. Find the **test phone number**
3. Send a test message: `"flu symptoms"`
4. Your bot should respond!

---

## 🔧 Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `FACEBOOK_ACCESS_TOKEN` | Access token for API calls | `EAABs...` |
| `FACEBOOK_PHONE_NUMBER_ID` | Your WhatsApp number ID | `123456789012345` |
| `FACEBOOK_VERIFY_TOKEN` | Custom token for webhook verification | `my_verify_token_123` |
| `FACEBOOK_APP_SECRET` | App secret for security | `abc123...` |

---

## 🆓 Free Tier Limits

- **1,000 free messages/month**
- **No daily limits** (unlike Twilio)
- **No sandbox restrictions**
- Perfect for health chatbots!

---

## 🔍 Troubleshooting

### Bot Not Responding?
1. Check webhook URL is correct
2. Verify all environment variables are set
3. Check app logs: `your-app.onrender.com/health`

### Webhook Verification Failed?
1. Ensure verify token matches exactly
2. Check webhook URL format
3. Verify app is deployed and accessible

### Messages Not Sending?
1. Check access token is valid
2. Verify phone number ID is correct
3. Ensure message format is valid

---

## 🎯 Testing Your Setup

### Local Testing:
```bash
npm start
# Check logs for: "✅ Facebook WhatsApp Business service initialized"
```

### Webhook Testing:
1. Deploy to Render/Vercel
2. Set webhook URL in Meta dashboard
3. Send test message
4. Check logs for successful response

---

## 📱 Production Deployment

1. **Deploy your app** to Render/Vercel
2. **Set environment variables** in hosting platform
3. **Configure webhook** in Meta dashboard
4. **Test thoroughly** with different message types
5. **Apply for business verification** (optional, for higher limits)

Your WhatsApp Health Chatbot is now powered by official Facebook Business API! 🎉

---

## 🔄 Migration Benefits

**Before (Twilio):**
- ❌ 9 messages/day limit
- ❌ Sandbox restrictions
- ❌ Complex pricing

**After (Facebook Business):**
- ✅ 1,000 messages/month
- ✅ Direct WhatsApp integration
- ✅ Better reliability
- ✅ No daily limits