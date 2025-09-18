// Netlify Function for User Login
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'healthbot-super-secret-key-2025-sih-project';

// Simple in-memory user store (in production, use a database)
let users = [];

// Load users
function loadUsers() {
    try {
        // In production, you'd load from a database
        return users;
    } catch (error) {
        console.error('Error loading users:', error.message);
    }
    return [];
}

exports.handler = async (event, context) => {
    // Add CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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

        console.log('🔐 Login request for:', requestBody.email);
        
        const { email, password } = requestBody;
        
        if (!email || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email and password are required' })
            };
        }
        
        // For demo purposes, accept any email/password combination
        // In production, you'd validate against a real database
        console.log('✅ Demo login successful for:', email);
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: Date.now().toString(), email: email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                token,
                user: {
                    id: Date.now().toString(),
                    name: email.split('@')[0], // Use email prefix as name
                    email: email,
                    whatsappNumbers: []
                },
                message: 'Login successful! Note: This is a demo mode.'
            })
        };
        
    } catch (error) {
        console.error('Login error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};