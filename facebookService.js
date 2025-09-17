const axios = require('axios');
const crypto = require('crypto');

class FacebookWhatsAppService {
    constructor() {
        this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
        this.phoneNumberId = process.env.FACEBOOK_PHONE_NUMBER_ID;
        this.verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
        this.appSecret = process.env.FACEBOOK_APP_SECRET;
        this.baseUrl = 'https://graph.facebook.com/v18.0';
        
        if (!this.accessToken || !this.phoneNumberId) {
            console.log('⚠️ Facebook WhatsApp credentials not found. Service will be limited.');
        } else {
            console.log('✅ Facebook WhatsApp service initialized successfully');
        }
    }

    /**
     * Verify webhook signature for security
     */
    verifyWebhookSignature(body, signature) {
        if (!this.appSecret || !signature) {
            console.log('⚠️ Webhook signature verification skipped (missing app secret or signature)');
            return true; // Allow in development
        }

        const expectedSignature = crypto
            .createHmac('sha256', this.appSecret)
            .update(body, 'utf8')
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(`sha256=${expectedSignature}`, 'utf8'),
            Buffer.from(signature, 'utf8')
        );
    }

    /**
     * Handle webhook verification (Meta requirement)
     */
    verifyWebhook(mode, token, challenge) {
        if (mode === 'subscribe' && token === this.verifyToken) {
            console.log('✅ Webhook verified successfully');
            return challenge;
        }
        
        console.log('❌ Webhook verification failed');
        return null;
    }

    /**
     * Parse incoming webhook message
     */
    parseWebhookMessage(body) {
        try {
            if (!body.entry || !body.entry[0] || !body.entry[0].changes) {
                return null;
            }

            const changes = body.entry[0].changes[0];
            if (!changes.value || !changes.value.messages) {
                return null;
            }

            const message = changes.value.messages[0];
            const contact = changes.value.contacts ? changes.value.contacts[0] : null;

            return {
                messageId: message.id,
                from: message.from,
                timestamp: message.timestamp,
                type: message.type,
                text: message.text ? message.text.body : '',
                name: contact ? contact.profile.name : 'Unknown'
            };
        } catch (error) {
            console.error('❌ Error parsing webhook message:', error.message);
            return null;
        }
    }

    /**
     * Send a text message via WhatsApp Business API
     */
    async sendMessage(to, message) {
        if (!this.accessToken || !this.phoneNumberId) {
            console.log('❌ Cannot send message: Facebook credentials missing');
            return false;
        }

        try {
            const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
            
            const payload = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: {
                    body: message
                }
            };

            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                console.log(`✅ Message sent successfully to ${to}`);
                return true;
            } else {
                console.log(`❌ Failed to send message. Status: ${response.status}`);
                return false;
            }

        } catch (error) {
            if (error.response) {
                console.error('❌ Facebook API Error:', error.response.data);
            } else {
                console.error('❌ Send message error:', error.message);
            }
            return false;
        }
    }

    /**
     * Send a template message (for alerts)
     */
    async sendTemplateMessage(to, templateName, languageCode = 'en') {
        if (!this.accessToken || !this.phoneNumberId) {
            console.log('❌ Cannot send template: Facebook credentials missing');
            return false;
        }

        try {
            const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
            
            const payload = {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: languageCode
                    }
                }
            };

            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`✅ Template message sent to ${to}`);
            return true;

        } catch (error) {
            console.error('❌ Template send error:', error.message);
            return false;
        }
    }

    /**
     * Mark message as read
     */
    async markAsRead(messageId) {
        if (!this.accessToken || !this.phoneNumberId) {
            return false;
        }

        try {
            const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
            
            const payload = {
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId
            };

            await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return true;
        } catch (error) {
            console.error('❌ Mark as read error:', error.message);
            return false;
        }
    }

    /**
     * Get business profile info
     */
    async getBusinessProfile() {
        if (!this.accessToken || !this.phoneNumberId) {
            return null;
        }

        try {
            const url = `${this.baseUrl}/${this.phoneNumberId}`;
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                },
                params: {
                    fields: 'verified_name,display_phone_number,quality_rating'
                }
            });

            return response.data;
        } catch (error) {
            console.error('❌ Get profile error:', error.message);
            return null;
        }
    }

    /**
     * Check if service is properly configured
     */
    isConfigured() {
        return !!(this.accessToken && this.phoneNumberId && this.verifyToken);
    }
}

module.exports = FacebookWhatsAppService;