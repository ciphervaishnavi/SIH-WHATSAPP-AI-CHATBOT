// Netlify Function for WhatsApp Registration
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'healthbot-super-secret-key-2025-sih-project';
const usersFilePath = path.join(__dirname, '../../users.json');

// Load users
function loadUsers() {
    try {
        if (fs.existsSync(usersFilePath)) {
            const data = fs.readFileSync(usersFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading users:', error.message);
    }
    return [];
}

// Save users
function saveUsers(users) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users:', error.message);
        return false;
    }
}

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        // Get authorization header
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }
        
        const { phoneNumber } = JSON.parse(event.body);
        
        if (!phoneNumber) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Phone number is required' })
            };
        }
        
        const users = loadUsers();
        
        // Find user
        const userIndex = users.findIndex(u => u.id === decoded.userId);
        if (userIndex === -1) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'User not found' })
            };
        }
        
        // Check if phone number already registered
        if (users[userIndex].whatsappNumbers && users[userIndex].whatsappNumbers.includes(phoneNumber)) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Phone number already registered' })
            };
        }
        
        // Add phone number
        if (!users[userIndex].whatsappNumbers) {
            users[userIndex].whatsappNumbers = [];
        }
        users[userIndex].whatsappNumbers.push(phoneNumber);
        
        if (saveUsers(users)) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    message: 'WhatsApp number registered successfully',
                    whatsappNumbers: users[userIndex].whatsappNumbers
                })
            };
        } else {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Failed to save user data' })
            };
        }
        
    } catch (error) {
        console.error('WhatsApp registration error:', error.message);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};