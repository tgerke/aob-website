const nodemailer = require('nodemailer');

const jsonResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(body)
});

exports.handler = async function(event, context) {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return jsonResponse(200, {});
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { message: 'Method Not Allowed' });
    }

    // Check if required environment variables are set
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
        console.error('Missing environment variables:', missingEnvVars);
        return jsonResponse(500, { 
            message: 'Server configuration error',
            details: `Missing environment variables: ${missingEnvVars.join(', ')}`
        });
    }

    try {
        // Log the incoming request body
        console.log('Received request body:', event.body);
        
        const {
            email,
            playerName,
            parentName,
            ageGroup,
            gradYear,
            school,
            positionsPlayed,
            phone,
            notes
        } = JSON.parse(event.body);

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return jsonResponse(400, { message: 'Invalid email address' });
        }

        const safe = (value) => (value && String(value).trim()) || 'Not provided';

        // Configure email transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });

        // Log SMTP configuration (without sensitive data)
        console.log('SMTP Configuration:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            user: process.env.SMTP_USER ? '***' : 'not set',
            from: process.env.SMTP_FROM
        });

        // Compose email content
        const emailText = `New interest form submission:
Age Group: ${safe(ageGroup)}
Player Name: ${safe(playerName)}
Parent/Guardian: ${safe(parentName)}
Grad Year / Grade: ${safe(gradYear)}
School: ${safe(school)}
Positions: ${safe(positionsPlayed)}
Email: ${email}
Phone: ${safe(phone)}
Notes: ${safe(notes)}`;
        const emailHtml = `
            <p><strong>New interest form submission:</strong></p>
            <ul>
                <li><strong>Age Group:</strong> ${safe(ageGroup)}</li>
                <li><strong>Player Name:</strong> ${safe(playerName)}</li>
                <li><strong>Parent/Guardian:</strong> ${safe(parentName)}</li>
                <li><strong>Grad Year / Grade:</strong> ${safe(gradYear)}</li>
                <li><strong>School:</strong> ${safe(school)}</li>
                <li><strong>Positions:</strong> ${safe(positionsPlayed)}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Phone:</strong> ${safe(phone)}</li>
                <li><strong>Notes:</strong> ${safe(notes)}</li>
            </ul>
            <p>Time: ${new Date().toLocaleString()}</p>
        `;

        // Send notification email to both Travis and Mike
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: ['travis@academyofbaseball.org', 'mike@academyofbaseball.org'],
            subject: `New AoB Interest Form${ageGroup ? ' — ' + ageGroup : ''}`,
            text: emailText,
            html: emailHtml
        });

        return jsonResponse(200, { message: 'Successfully subscribed!' });
    } catch (error) {
        // Log the full error
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });

        return jsonResponse(500, { 
            message: 'Internal server error',
            details: error.message
        });
    }
}; 