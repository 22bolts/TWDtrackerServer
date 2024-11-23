// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Transactions } from '../Entities/Transactions';
import { Users } from '../Entities/Users';
import { Orders } from '../Entities/Orders';

const stripe = new Stripe('your-stripe-secret-key', { apiVersion: '2024-06-20' });

export const stripePaymentHandler = async (req: Request, res: Response) => {
    const { amount, paymentMethodId, userId, orderId } = req.body;

    try {
        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
        });

        // Record the transaction
        await recordTransaction(paymentIntent.id, amount, 'stripe', 'success', userId, orderId);

        // Update the user's balance
        await updateUserBalance(userId, amount);

        // Respond with success
        res.status(200).send({ success: true, paymentIntent });
    } catch (error: any) {
        // Handle any errors
        res.status(400).send({ error: error.message });
    }
};

// Function to record the transaction
const recordTransaction = async (
    paymentId: string,
    amount: number,
    method: string,
    status: string,
    userId: number,
    orderId: number
) => {
    const user = await Users.findOne({ where: { id: userId } });
    const order = await Orders.findOne({ where: { id: orderId } });

    if (!user || !order) {
        throw new Error('User or Order not found');
    }

    const transaction = new Transactions();
    transaction.id = Number(paymentId);
    transaction.amount = amount;
    transaction.payment_method = method;
    transaction.status = status;
    transaction.user = user;
    transaction.order = order;

    await transaction.save();
};

// Function to update the user's balance
const updateUserBalance = async (userId: number, amount: number) => {
    const user = await Users.findOne({ where: { id: userId } });

    if (!user) {
        throw new Error('User not found');
    }

    user.balance = (user.balance || 0) + amount;
    await user.save();
};
