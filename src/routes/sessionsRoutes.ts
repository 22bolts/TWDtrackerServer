import { Router } from 'express';
import { OTP } from '../Entities/OTP';
import { Users } from '../Entities/Users';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Client, Environment, ApiError } from 'square';
import { Sessions } from '../Entities/Sessions';
import { Clients } from '../Entities/Clients';
import { Trainers } from '../Entities/Trainers';
import { Payments } from '../Entities/Payments';

const router = Router();

// Periodically delete expired OTPs (runs every 5 minutes)
setInterval(async () => {
    await OTP.createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now: new Date() })
        .execute();
    console.log('Expired OTPs cleaned up');
}, 5 * 60 * 1000);

const squareClient = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Production
});

router.get('/all-sessions', async (req, res) => {
    try {
        // Fetch all sessions with related client and trainer data
        const sessions = await Sessions.createQueryBuilder('session')
            .leftJoinAndSelect('session.client', 'client') // Assuming `client` is a relation in Sessions
            .leftJoinAndSelect('client.user', 'clientUser') // Assuming `user` is a relation in Clients
            .leftJoinAndSelect('session.trainer', 'trainer') // Assuming `trainer` is a relation in Sessions
            .leftJoinAndSelect('trainer.user', 'trainerUser') // Assuming `user` is a relation in Trainers
            .orderBy('session.startedAt', 'DESC')
            .getMany();

        if (sessions.length === 0) {
            return res.status(404).json({ message: 'No sessions found' });
        }

        res.status(200).json({ message: 'All sessions retrieved successfully', sessions });
    } catch (error) {
        console.error('Error fetching all sessions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Generate OTP
router.post('/generate', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        const client = await Clients.createQueryBuilder('client')
            .innerJoinAndSelect('client.user', 'user')
            .where('user.email = :email', { email })
            .getOne();
            
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Generate a longer OTP for better security since it's now a unique identifier
        const otp = crypto.randomInt(100000000, 999999999).toString(); // 9-digit OTP
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Extended to 5 minutes

        const newOTP = OTP.create({ 
            clientEmail: email, // Store client email for reference
            otp,
            expiresAt,
            clientId: client.id // Store client ID for easy access later
        });
        await newOTP.save();

        // Simulate sending OTP (Replace with real email service)
        console.log(`Session code for client ${email}: ${otp}`);
        res.status(200).json({ message: 'Session code generated and sent to email', otp });
    } catch (error) {
        console.error('Error generating session code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Validate OTP and create session (called by trainer)
router.post('/validate-and-create-session', async (req, res) => {
    const { otp, trainerEmail } = req.body;
    
    if (!otp || !trainerEmail) {
        return res.status(400).json({ message: 'Session code and trainer email are required' });
    }

    try {
        // Find the OTP entry regardless of client email
        const validOTP = await OTP.findOne({ where: { otp } });
        
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid session code' });
        }

        if (validOTP.expiresAt < new Date()) {
            await OTP.delete({ id: validOTP.id });
            return res.status(400).json({ message: 'Session code expired' });
        }

        // Get trainer with relations
        const trainer = await Trainers.createQueryBuilder('trainer')
            .innerJoinAndSelect('trainer.user', 'user')
            .leftJoinAndSelect('trainer.clients', 'clients')
            .where('user.email = :email', { email: trainerEmail })
            .getOne();

        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        // Get client with relations
        const client = await Clients.createQueryBuilder('client')
            .innerJoinAndSelect('client.user', 'user')
            .leftJoinAndSelect('client.trainers', 'trainers')
            .where('client.id = :id', { id: validOTP.clientId })
            .getOne();

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Decrease the purchased count for the client's user
        if (client.user.purchased > 0) {
            client.user.purchased -= 1;
            await client.user.save();
        } else {
            return res.status(400).json({ message: 'No purchased sessions available' });
        }

        // Delete the used OTP
        await OTP.delete({ id: validOTP.id });

        // Initialize arrays if they don't exist
        if (!client.trainers) client.trainers = [];
        if (!trainer.clients) trainer.clients = [];

        // Add trainer to client's trainers list if not already present
        const isTrainerAlreadyAdded = client.trainers.some(t => t.id === trainer.id);
        if (!isTrainerAlreadyAdded) {
            client.trainers.push(trainer);
        }

        // Add client to trainer's clients list if not already present
        const isClientAlreadyAdded = trainer.clients.some(c => c.id === client.id);
        if (!isClientAlreadyAdded) {
            trainer.clients.push(client);
        }

        // Save updated relationships
        await client.save();
        await trainer.save();

        // Create new session
        const session = await Sessions.create({
            clientId: client.id,
            trainerId: trainer.id,
            email: validOTP.clientEmail,
            trainerEmail,
            startedAt: new Date(),
        });
        await session.save();

        res.status(200).json({ 
            message: 'Session started successfully', 
            session,
            clientEmail: validOTP.clientEmail
        });
    } catch (error) {
        console.error('Error creating session:', error);
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

        // Increment the completed sessions count
        user.completed += 1;
        await user.save();

        // Step 4: Fetch the client and trainer entities
        const client = await Clients.createQueryBuilder('client')
            .innerJoinAndSelect('client.user', 'user')
            .where('user.email = :email', { email: session.email })
            .getOne();

        const trainer = await Trainers.createQueryBuilder('trainer')
            .innerJoinAndSelect('trainer.user', 'user')
            .where('user.email = :email', { email: session.trainerEmail })
            .getOne();

        if (!client || !trainer) {
            return res.status(404).json({ message: 'Client or Trainer not found' });
        }

        // Step 5: Add the trainer to the client's list and the client to the trainer's list
        if (!client.trainers) client.trainers = [];
        if (!trainer.clients) trainer.clients = [];

        // Check if they are already associated
        if (!client.trainers.some((t) => t.id === trainer.id)) {
            client.trainers.push(trainer);
            await client.save();
        }

        if (!trainer.clients.some((c) => c.id === client.id)) {
            trainer.clients.push(client);
            await trainer.save();
        }

        res.status(200).json({ message: 'Session confirmed and completed successfully, associations updated' });
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

router.post('/purchase-session', async (req, res) => {
    const { userId, amount = 1 } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // Find the user
        const user = await Users.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Increment the purchase count
        user.purchased = (user.purchased || 0) + amount;
        await user.save();

        res.status(200).json({ 
            message: 'Purchase count updated successfully',
            user: {
                id: user.id,
                purchased: user.purchased
            }
        });

    } catch (error) {
        console.error('Error updating purchase count:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/process-payment', async (req, res) => {
    const { sessionId, paymentSourceId, amount } = req.body;

    try {
        // 1. Get session details
        const session = await Sessions.findOne({ 
            where: { id: sessionId }
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // 2. Create payment record
        const paymentRecord = Payments.create({
            sessionId: session.id,
            clientId: session.clientId,
            trainerId: session.trainerId,
            amount: amount / 100, // Convert cents to dollars for storage
            gym: session.gym,
            status: 'pending',
            note: `Training session payment for ${session.email}`
        });
        await paymentRecord.save();

        // 3. Process payment through Square
        const squarePayment = {
            sourceId: paymentSourceId,
            amountMoney: {
                amount: amount, // Amount in cents
                currency: 'USD'
            },
            idempotencyKey: `${sessionId}-${Date.now()}`,
            note: paymentRecord.note,
            metadata: {
                paymentId: paymentRecord.id.toString(),
                sessionId: sessionId.toString(),
                clientEmail: session.email,
                trainerEmail: session.trainerEmail
            }
        };

        const { result } = await squareClient.paymentsApi.createPayment(squarePayment);

        // 4. Update payment record with Square data
        paymentRecord.squarePaymentId = result.payment?.id ?? "";

        paymentRecord.status = 'completed';
        paymentRecord.processedAt = new Date();
        paymentRecord.squareData = result.payment;
        await paymentRecord.save();

        // 5. Update session status
        session.status = 'completed';
        session.completedAt = new Date();
        await session.save();

        // 6. Increment client's purchase count
        const client = await Clients.createQueryBuilder('client')
            .innerJoinAndSelect('client.user', 'user')
            .where('client.id = :clientId', { clientId: session.clientId })
            .getOne();

        if (client && client.user) {
            client.user.purchased = (client.user.purchased || 0) + 1;
            await client.user.save();
        }

        res.status(200).json({ 
            message: 'Payment processed successfully',
            payment: paymentRecord,
            session
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        if (error instanceof ApiError) {
            // Update payment record to failed if it exists
            const failedPayment = await Payments.findOne({ 
                where: { sessionId }
            });
            if (failedPayment) {
                failedPayment.status = 'failed';
                failedPayment.squareData = error.result;
                await failedPayment.save();
            }

            res.status(400).json({ 
                message: 'Payment processing failed',
                error: error.result 
            });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

router.post('/square-webhook', async (req, res) => {
    const { type, data } = req.body;

    try {
        switch (type) {
            case 'payment.updated': {
                const squarePayment = data.object.payment;
                const paymentId = squarePayment.metadata?.paymentId;

                if (paymentId) {
                    const payment = await Payments.findOne({ 
                        where: { id: parseInt(paymentId) }
                    });

                    if (payment) {
                        payment.status = squarePayment.status.toLowerCase();
                        payment.squareData = squarePayment;
                        
                        if (squarePayment.status === 'COMPLETED' && payment.status !== 'completed') {
                            payment.processedAt = new Date();
                            
                            // Increment purchase count if not already done
                            const client = await Clients.createQueryBuilder('client')
                                .innerJoinAndSelect('client.user', 'user')
                                .where('client.id = :clientId', { clientId: payment.clientId })
                                .getOne();

                            if (client && client.user) {
                                client.user.purchased = (client.user.purchased || 0) + 1;
                                await client.user.save();
                            }
                        }
                        
                        await payment.save();
                    }
                }
                break;
            }

            case 'payment.failed': {
                const squarePayment = data.object.payment;
                const paymentId = squarePayment.metadata?.paymentId;

                if (paymentId) {
                    const payment = await Payments.findOne({ 
                        where: { id: parseInt(paymentId) }
                    });

                    if (payment) {
                        payment.status = 'failed';
                        payment.squareData = squarePayment;
                        await payment.save();
                    }
                }
                break;
            }
        }

        res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export { router as sessionRouter };
