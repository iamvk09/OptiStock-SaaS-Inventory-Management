import express from 'express';
import { Resend } from 'resend';

const router = express.Router();

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL || 'noreply@optistock.app';

if (!resendApiKey) {
    console.warn('RESEND_API_KEY is missing. Email sending will fail.');
}

const resend = new Resend(resendApiKey);

router.post('/send-welcome', async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Welcome to OptiStock!',
            html: `
        <h1>Welcome to OptiStock, ${name || 'User'}!</h1>
        <p>We are excited to have you on board.</p>
        <p>Get started by setting up your organization and inviting your team.</p>
        <br/>
        <p>Best regards,</p>
        <p>The OptiStock Team</p>
      `,
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'Welcome email sent successfully', data });
    } catch (error: any) {
        console.error('Email sending failed:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
