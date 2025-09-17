// Direct Facebook API test
const axios = require('axios');
require('dotenv').config();

async function testFacebookAPI() {
    console.log('🧪 Testing Facebook API directly...');
    console.log('====================================');
    
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const phoneNumberId = process.env.FACEBOOK_PHONE_NUMBER_ID;
    
    console.log('📋 Configuration:');
    console.log(`   Access Token: ${accessToken ? accessToken.substring(0, 20) + '...' : 'Missing'}`);
    console.log(`   Phone Number ID: ${phoneNumberId || 'Missing'}`);
    console.log(`   Base URL: https://graph.facebook.com/v18.0`);
    
    if (!accessToken || !phoneNumberId) {
        console.log('❌ Missing required credentials');
        return;
    }
    
    // Test 1: Check phone number info
    try {
        console.log('\n🔍 Test 1: Getting phone number info...');
        const infoUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}`;
        const infoResponse = await axios.get(infoUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log('✅ Phone number info:', JSON.stringify(infoResponse.data, null, 2));
    } catch (error) {
        console.log('❌ Phone number info error:', error.response?.data || error.message);
    }
    
    // Test 2: Send template message
    try {
        console.log('\n📤 Test 2: Sending template message...');
        const messageUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
        const payload = {
            messaging_product: 'whatsapp',
            to: '919376308345',
            type: 'template',
            template: {
                name: 'hello_world',
                language: { code: 'en_US' }
            }
        };
        
        console.log('📋 Payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post(messageUrl, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Template message sent successfully!');
        console.log('📨 Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Template message failed:');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('   Error:', error.message);
        }
    }
    
    // Test 3: Send text message
    try {
        console.log('\n📤 Test 3: Sending text message...');
        const messageUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
        const payload = {
            messaging_product: 'whatsapp',
            to: '919376308345',
            type: 'text',
            text: {
                body: '🤖 Test message from health bot! If you receive this, the API is working!'
            }
        };
        
        console.log('📋 Payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post(messageUrl, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Text message sent successfully!');
        console.log('📨 Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Text message failed:');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('   Error:', error.message);
        }
    }
}

testFacebookAPI().catch(console.error);