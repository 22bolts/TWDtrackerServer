// src/controllers/withdrawalController.ts
import { Request, Response } from 'express';
import { Users } from '../Entities/Users';
import { Transactions } from '../Entities/Transactions';

export const withdrawFunds = async (req: Request, res: Response) => {
    const { userId, amount } = req.body;

    const user = await Users.findOne(userId);
    if (user && user.balance >= amount) {
        user.balance -= amount;

        // Process withdrawal (e.g., through Stripe or another service)

        await user.save();

        res.status(200).send({ success: true });
    } else {
        res.status(400).send({ error: 'Insufficient balance' });
    }
};

export const setAutoWithdrawal = async (req: Request, res: Response) => {
    const { userId, autoWithdrawal } = req.body;

    const user = await Users.findOne(userId);
    if (user) {
        user.autoWithdrawal = autoWithdrawal;
        await user.save();

        res.status(200).send({ success: true });
    } else {
        res.status(400).send({ error: 'User not found' });
    }
};
