const crypto = require('crypto');

const jsonResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(body)
});

// Generate a secure session token
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

exports.handler = async function(event, context) {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return jsonResponse(200, {});
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { message: 'Method Not Allowed' });
    }

    try {
        const { password } = JSON.parse(event.body);

        // Check if MEMBERS_PASSWORD environment variable is set
        if (!process.env.MEMBERS_PASSWORD) {
            console.error('MEMBERS_PASSWORD environment variable is not set');
            return jsonResponse(500, { 
                message: 'Server configuration error',
                details: 'Password protection is not configured'
            });
        }

        // Verify password
        if (password === process.env.MEMBERS_PASSWORD) {
            // Generate a session token
            const sessionToken = generateSessionToken();
            
            // In a production environment, you'd want to store this token
            // in a database with an expiration time. For simplicity,
            // we'll return it and let the client store it.
            return jsonResponse(200, { 
                success: true,
                sessionToken: sessionToken,
                message: 'Authentication successful'
            });
        } else {
            return jsonResponse(401, { 
                success: false,
                message: 'Invalid password'
            });
        }
    } catch (error) {
        console.error('Error in verify-password function:', error);
        return jsonResponse(500, { 
            message: 'Internal server error',
            details: error.message
        });
    }
};
