// Netlify Function for User Registration
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'healthbot-super-secret-key-2025-sih-project';

// For Netlify functions, we need to handle file storage differently
let users = [];

// Load users from environment or use empty array
function loadUsers() {
    try {
        // In production, you might want to use a database
        // For now, we'll use a simple in-memory store
        return users;
    } catch (error) {
        console.error('Error loading users:', error.message);
    }
    return [];
}

// Save users (in production, use a database)
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
    // Add CORS headers for browser requests
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
        // Better body parsing with error handling
        let requestBody;
        try {
            requestBody = event.body ? JSON.parse(event.body) : {};
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        console.log('📝 Registration request body:', requestBody);
        
        const { name, email, password } = requestBody;
        
        // More detailed validation
        if (!name || !email || !password) {
            console.log('❌ Missing fields:', { name: !!name, email: !!email, password: !!password });
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'All fields are required',
                    received: { name: !!name, email: !!email, password: !!password }
                })
            };
        }

        // For demo purposes, we'll create a simple response
        // In production, you'd want to use a proper database
        console.log('✅ Registration successful for:', email);
        
        // Generate a demo token
        const token = jwt.sign(
            { userId: Date.now().toString(), email: email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                token,
                user: {
                    id: Date.now().toString(),
                    name: name,
                    email: email,
                    whatsappNumbers: []
                },
                message: 'Registration successful! Note: This is a demo - data is not persisted.'
            })
        };
        
    } catch (error) {
        console.error('Registration error:', error.message);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};