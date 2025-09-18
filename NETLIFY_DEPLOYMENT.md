# Netlify Deployment Guide

This guide walks you through deploying your WhatsApp Health Chatbot to Netlify.

## 🌟 What's Included

- **Serverless Functions**: WhatsApp webhook, user registration, login, and WhatsApp number management
- **Static Dashboard**: Beautiful web interface for user registration and WhatsApp integration
- **Environment Variables**: Secure configuration for all APIs
- **Auto-scaling**: Netlify automatically scales your functions

## 📋 Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **API Keys**: Facebook Business, Google LLM, and Hugging Face API keys
4. **Domain** (optional): Custom domain for production use

## 🚀 Deployment Steps

### Step 1: Connect GitHub Repository

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your repository: `SIH-WHATSAPP-AI-CHATBOT`

### Step 2: Configure Build Settings

Netlify should auto-detect your settings, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `public`
- **Functions directory**: `netlify/functions`

### Step 3: Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

```
HUGGINGFACE_API_KEY=your_huggingface_api_key
GOOGLE_LLM_API_KEY=your_google_api_key
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_PHONE_NUMBER_ID=your_phone_number_id
FACEBOOK_VERIFY_TOKEN=your_verify_token
FACEBOOK_APP_SECRET=your_app_secret
JWT_SECRET=your_jwt_secret
```

### Step 4: Deploy

1. Click "Deploy site"
2. Wait for build to complete (2-5 minutes)
3. Your site will be available at: `https://random-name-123.netlify.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS settings as instructed

## 🔧 Configure Facebook Webhook

After deployment, update your Facebook App webhook URL:

1. Go to [Facebook Developers Console](https://developers.facebook.com)
2. Navigate to your app → WhatsApp → Configuration
3. Set webhook URL to: `https://your-site.netlify.app/api/webhook`
4. Set verify token: `vaivaivai123123` (or your custom token)

## 📊 Function Endpoints

Your deployed functions will be available at:

- **Webhook**: `https://your-site.netlify.app/api/webhook`
- **Registration**: `https://your-site.netlify.app/api/register`
- **Login**: `https://your-site.netlify.app/api/login`
- **WhatsApp Register**: `https://your-site.netlify.app/api/whatsapp-register`

## 🔍 Testing Your Deployment

### Test Dashboard
1. Visit your Netlify URL
2. Try registration/login
3. Test WhatsApp integration

### Test WhatsApp Webhook
1. Send a test message to your WhatsApp Business number
2. Check Netlify Functions logs for webhook activity
3. Verify bot responses

## 📈 Monitoring

### Netlify Analytics
- Go to Site overview → Analytics
- Monitor function invocations, bandwidth, and performance

### Function Logs
- Go to Functions tab
- Click on any function to view logs
- Monitor errors and performance

## 🚨 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Check build logs in Netlify Dashboard
# Ensure all dependencies are in package.json
```

**Functions Not Working**
```bash
# Check environment variables are set
# Verify function paths in netlify.toml
# Check function logs for errors
```

**WhatsApp Not Responding**
```bash
# Verify webhook URL in Facebook console
# Check environment variables
# Test function directly via URL
```

### Debug Mode

Add debug logging to your functions:
```javascript
console.log('Debug:', { event, context });
```

View logs in Netlify Dashboard → Functions → [Function Name]

## 💰 Pricing

### Netlify Free Tier Includes:
- 100GB bandwidth/month
- 125,000 function invocations/month
- 100 hours function runtime/month
- Custom domain support

This is perfect for development and moderate production use.

### Upgrade When You Need:
- More bandwidth
- Higher function limits
- Analytics and monitoring
- Team collaboration features

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit API keys to Git
2. **HTTPS Only**: Netlify provides SSL automatically
3. **Function Validation**: Validate all inputs in functions
4. **Rate Limiting**: Implement rate limiting for APIs
5. **JWT Security**: Use strong JWT secrets

## 📝 File Structure

```
your-project/
├── netlify/
│   └── functions/          # Serverless functions
│       ├── webhook.js      # WhatsApp webhook
│       ├── register.js     # User registration
│       ├── login.js        # User login
│       └── whatsapp-register.js # WhatsApp integration
├── public/                 # Static dashboard files
│   ├── index.html         # Dashboard UI
│   ├── style.css          # Styling
│   └── script.js          # Frontend logic
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies
└── README.md              # Documentation
```

## 🎯 Next Steps

1. **Custom Domain**: Set up your branded domain
2. **Analytics**: Monitor usage and performance
3. **Scaling**: Upgrade plan as needed
4. **Features**: Add more chatbot capabilities
5. **Integration**: Connect to external services

## 📞 Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Community**: [answers.netlify.com](https://answers.netlify.com)
- **Status**: [netlifystatus.com](https://netlifystatus.com)

---

🎉 **Congratulations!** Your WhatsApp Health Chatbot is now live on Netlify with automatic scaling, secure HTTPS, and professional hosting.