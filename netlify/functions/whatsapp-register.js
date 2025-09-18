// Netlify Function for WhatsApp Registration
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'healthbot-super-secret-key-2025-sih-project';

// Simple in-memory user store (in production, use a database)
let users = [];

// Load users
function loadUsers() {
    try {
        return users;
    } catch (error) {
        console.error('Error loading users:', error.message);
    }
    return [];
}

// Save users
function saveUsers(newUsers) {
    try {
        users = newUsers;
        return true;
    } catch (error) {
        console.error('Error saving users:', error.message);
        return false;
    }
}

exports.handler = async (event, context) => {
    // Add CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        // Get authorization header
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'No token provided' })
            };
        }
        
        const token = authHeader.substring(7);
        
        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }
        
        let requestBody;
        try {
            requestBody = event.body ? JSON.parse(event.body) : {};
        } catch (parseError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        const { phoneNumber } = requestBody;
        
        if (!phoneNumber) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Phone number is required' })
            };
        }
        
        console.log('📱 WhatsApp registration for:', phoneNumber, 'by user:', decoded.email);
        
        // For demo purposes, just return success
        // In production, you'd store this in a database
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'WhatsApp number registered successfully',
                whatsappNumbers: [phoneNumber],
                note: 'Demo mode - data not persisted'
            })
        };
        
    } catch (error) {
        console.error('WhatsApp registration error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};