# 🔑 Google LLM API Key Setup Guide

## Getting Your Google API Key (Free)

### Step 1: Go to Google AI Studio
1. Visit: [https://ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key)
2. Click **"Get API Key"**

### Step 2: Create API Key
1. Sign in with your Google account
2. Click **"Create API Key"**
3. Select a project (or create new one)
4. Copy your API key (starts with `AIza...`)

### Step 3: Add to Your Environment
```bash
GOOGLE_LLM_API_KEY=AIzaSyD...your_actual_api_key_here
```

### Step 4: Update Deployment
If using Render/Vercel:
1. Go to your app dashboard
2. Add environment variable: `GOOGLE_LLM_API_KEY`
3. Paste your API key as the value
4. Redeploy

## 🆓 Free Tier Limits
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

Perfect for a health chatbot! 🏥

## 🔧 Testing Your Setup

Send this message to your WhatsApp bot:
```
What are the symptoms of migraine?
```

Look for this in logs:
```
✅ Google LLM response generated in English
```

## 🔄 Fallback System

Your bot has multiple AI layers:
1. **JSON Knowledge Base** (instant responses)
2. **Google LLM** (smart, trained responses)
3. **Hugging Face LLM** (backup AI)
4. **Smart Health Fallback** (always works)

This ensures users always get helpful answers! 🎯