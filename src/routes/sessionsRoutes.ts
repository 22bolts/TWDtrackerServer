import { Router } from 'express';
import { OTP } from '../Entities/OTP';
import { Users } from '../Entities/Users';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Sessions } from '../Entities/Sessions';
import { Clients } from '../Entities/Clients';
import { Trainers } from '../Entities/Trainers';

const router = Router();

// Periodically delete expired OTPs (runs every 5 minutes)
setInterval(async () => {
    await OTP.createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now: new Date() })
        .execute();
    console.log('Expired OTPs cleaned up');
}, 5 * 60 * 1000);

// Generate OTP
router.post('/generate', async (req, res) => {
    const { email, trainerEmail } = req.body;

    if (!email || !trainerEmail) {
        return res.status(400).json({ message: 'Email and trainerEmail are required' });
    }

    try {
        const client = await Clients.createQueryBuilder('client')
            .innerJoinAndSelect('client.user', 'user')
            .where('user.email = :email', { email })
            .getOne();

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const trainer = await Trainers.createQueryBuilder('trainer')
            .innerJoinAndSelect('trainer.user', 'user')
            .where('user.email = :email', { email: trainerEmail })
            .getOne();

        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

        const newOTP = OTP.create({ email, otp, trainerEmail, expiresAt });
        await newOTP.save();

        // Simulate sending OTP (Replace with real email service)
        console.log(`OTP for client ${email}: ${otp}`);

        res.status(200).json({ message: 'OTP generated and sent to email', otp });
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Validate OTP and Create Session
router.post('/validate', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        // Verify the OTP
        const validOTP = await OTP.findOne({ where: { email, otp } });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (validOTP.expiresAt < new Date()) {
            await OTP.delete({ id: validOTP.id });
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Fetch trainer email from OTP record
        const trainerEmail = validOTP.trainerEmail;

        if (!trainerEmail) {
            return res.status(400).json({ message: 'Trainer email not found in OTP' });
        }

        // Delete the OTP (used or validated)
        await OTP.delete({ id: validOTP.id });

        // Check if both client and trainer exist
        const client = await Clients.createQueryBuilder('client')
            .innerJoinAndSelect('client.user', 'user')
            .where('user.email = :email', { email })
            .getOne();

        const trainer = await Trainers.createQueryBuilder('trainer')
            .innerJoinAndSelect('trainer.user', 'user')
            .where('user.email = :email', { email: trainerEmail })
            .getOne();

        if (!client || !trainer) {
            return res.status(404).json({ message: 'Client or Trainer not found' });
        }

        // Create a new session record
        const session = await Sessions.create({
            clientId: client.id,
            trainerId: trainer.id,
            email: email,
            trainerEmail: trainerEmail,
            startedAt: new Date(), // Mark session start time
        });
        await session.save();

        res.status(200).json({ message: 'OTP validated and session started successfully', session });
    } catch (error) {
        console.error('Error validating OTP:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/confirm-session', async (req, res) => {
    const { email, sessionId, pin } = req.body;

    if (!email || !sessionId || !pin) {
        return res.status(400).json({ message: 'Email, sessionId, and PIN are required' });
    }

    try {
        // Step 1: Fetch the user and session
        const user = await Users.findOne({ where: { email } });
        const session = await Sessions.findOne({ where: { id: sessionId, email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.status === 'completed') {
            return res.status(400).json({ message: 'Session is already completed' });
        }

        // Step 2: Verify the PIN
        if (!user.hashedPin) {
            return res.status(400).json({ message: 'PIN not set for this user' });
        }

        const isMatch = await bcrypt.compare(pin, user.hashedPin);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid PIN' });
        }

        // Step 3: Mark the session as completed
        session.status = 'completed';
        session.completedAt = new Date();

        await session.save();

        res.status(200).json({ message: 'Session confirmed and completed successfully' });
    } catch (error) {
        console.error('Error confirming session:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


/**
 * Get a specific session by ID.
 */
router.get('/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        // Find the session by ID
        const session = await Sessions.findOne({ where: { id: parseInt(sessionId) } });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.status(200).json({ message: 'Session retrieved successfully', session });
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get all sessions associated with a user by their email.
 */
router.get('/user-sessions/:email', async (req, res) => {
    const { email } = req.params;

    try {
        // Validate if the user exists
        const user = await Users.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch all sessions associated with the user
        const sessions = await Sessions.createQueryBuilder('session')
            .where('session.email = :email OR session.trainerEmail = :email', { email })
            .orderBy('session.startedAt', 'DESC')
            .getMany();

        res.status(200).json({ message: 'Sessions retrieved successfully', sessions });
    } catch (error) {
        console.error('Error fetching user sessions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export { router as sessionRouter };
