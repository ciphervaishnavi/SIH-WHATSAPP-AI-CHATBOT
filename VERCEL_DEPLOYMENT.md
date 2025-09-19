# Vercel Deployment Guide

## 🚀 Quick Deployment to Vercel

### Step 1: Prepare Repository
Ensure your code is pushed to GitHub with the corrected `vercel.json` configuration.

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository: `SIH-WHATSAPP-AI-CHATBOT`
4. Vercel will automatically detect it as a Node.js project

### Step 3: Configure Environment Variables
In the Vercel dashboard, add these environment variables:

**Required Environment Variables:**
```
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_PHONE_NUMBER_ID=your_phone_number_id
FACEBOOK_VERIFY_TOKEN=your_verify_token
FACEBOOK_APP_SECRET=your_app_secret
GOOGLE_LLM_API_KEY=your_google_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
JWT_SECRET=healthbot-super-secret-key-2025-sih-project
NODE_ENV=production
```

### Step 4: Deploy
1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Get your production URL (e.g., `https://your-app.vercel.app`)

### Step 5: Update Facebook Webhook
1. Go to Facebook Developer Console
2. Navigate to WhatsApp > Configuration
3. Update Webhook URL to: `https://your-app.vercel.app/webhook`
4. Test the webhook verification

## 📁 File Structure for Vercel

```
project/
├── index.js                 # Main server file
├── vercel.json             # Vercel configuration
├── package.json            # Dependencies
├── public/                 # Static frontend files
│   ├── index.html
│   ├── style.css
│   └── script.js
├── healthData.json         # Health responses
├── users.json             # User database
└── facebookService.js     # Facebook API service
```

## 🔧 Vercel Configuration Explained

### vercel.json Breakdown:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"        // Build Node.js server
    },
    {
      "src": "public/**/*",
      "use": "@vercel/static"      // Serve static files
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/index.js"          // Route API calls to server
    },
    {
      "src": "/webhook",
      "dest": "/index.js"          // Route webhook to server
    },
    {
      "src": "/health",
      "dest": "/index.js"          // Route health check to server
    },
    {
      "src": "/style.css",
      "dest": "/public/style.css", // Explicit CSS routing
      "headers": {
        "Content-Type": "text/css"  // Ensure correct MIME type
      }
    },
    {
      "src": "/script.js", 
      "dest": "/public/script.js", // Explicit JS routing
      "headers": {
        "Content-Type": "application/javascript"
      }
    },
    {
      "src": "/",
      "dest": "/public/index.html" // Root serves index.html
    },
    {
      "src": "/(.*\\.(css|js|html|png|jpg|ico|svg))",
      "dest": "/public/$1"         // Serve other static files
    }
  ],
  "functions": {
    "index.js": {
      "maxDuration": 30           // 30 second timeout for webhook processing
    }
  },
  "headers": [
    {
      "source": "/(.*\\.css)",   // Global CSS headers
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/css"
        }
      ]
    },
    {
      "source": "/(.*\\.js)",    // Global JS headers
      "headers": [
        {
          "key": "Content-Type", 
          "value": "application/javascript"
        }
      ]
    }
  ]
}
```

## 🎯 Route Mapping

- `https://your-app.vercel.app/` → Serves `public/index.html`
- `https://your-app.vercel.app/api/register` → Handled by `index.js`
- `https://your-app.vercel.app/webhook` → Handled by `index.js`
- `https://your-app.vercel.app/health` → Handled by `index.js`
- `https://your-app.vercel.app/style.css` → Serves `public/style.css`

## ⚠️ Important Notes

### Security:
- **Never commit environment variables** to your repository
- Always set them in Vercel Dashboard under Project Settings > Environment Variables
- Use different values for development and production

### File System Limitations:
- Vercel functions are **read-only** after deployment
- `users.json` database won't persist changes
- Consider using external database for production (MongoDB, PostgreSQL)

### Function Limits:
- Maximum execution time: 30 seconds (configurable)
- Memory limit: 1024MB
- Request size limit: 4.5MB

## 🔄 Deployment Commands

### Vercel CLI (Optional):
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from command line
vercel

# Deploy to production
vercel --prod
```

### Manual Deployment:
1. Push code to GitHub
2. Vercel automatically redeploys on git push
3. Check deployment status in Vercel dashboard

## 🧪 Testing Vercel Deployment

### Health Check:
```bash
curl https://your-app.vercel.app/health
```

### Webhook Test:
```bash
curl -X GET "https://your-app.vercel.app/webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=your_token"
```

### Frontend Test:
Open `https://your-app.vercel.app` in browser to test dashboard

## 🐛 Troubleshooting

### Common Issues:

1. **Environment Variables Not Set**
   - Check Vercel Dashboard > Project Settings > Environment Variables
   - Ensure all required variables are added

2. **CSS/JS Files Not Loading (MIME Type Error)**
   - Error: "Refused to apply style because its MIME type ('text/html') is not a supported stylesheet MIME type"
   - **Solution**: The updated vercel.json includes explicit headers for CSS/JS files
   - **Cause**: Routes were incorrectly serving static files through the Node.js function

3. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`

4. **Function Timeouts**
   - Check if requests take longer than 30 seconds
   - Optimize AI/LLM response times

5. **Static Files Not Loading**
   - Ensure files are in `public/` directory
   - Check vercel.json routes configuration
   - Verify file extensions match the route patterns

### Logs and Monitoring:
- View real-time logs in Vercel Dashboard > Functions tab
- Monitor function performance and errors
- Set up alerts for critical failures

## 📊 Production Considerations

### Database:
For production, consider migrating from JSON files to:
- **MongoDB Atlas** (NoSQL)
- **PostgreSQL on Railway** (SQL)
- **Supabase** (PostgreSQL with real-time features)

### Monitoring:
- Set up uptime monitoring
- Monitor API quotas and rate limits
- Track error rates and response times

### Scaling:
- Vercel automatically scales based on traffic
- Monitor function invocation limits
- Consider upgrading plan for high traffic

This deployment configuration provides a robust, scalable solution for your WhatsApp Health Chatbot on Vercel's serverless platform.