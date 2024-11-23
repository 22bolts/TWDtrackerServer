// src/controllers/apiManagementController.ts
import { Request, Response } from 'express';
import { Apps } from '../Entities/Apps';
import { Users } from '../Entities/Users';
import { validateSubscription } from '../services/subscriptionService';

export const createApp = async (req: Request, res: Response) => {
    const { userId, appName } = req.body;

    const user = await Users.findOne(userId);
    if (user) {
        const app = new Apps();
        app.name = appName;
        app.user = user;
        await app.save();

        res.status(200).send({ success: true });
    } else {
        res.status(400).send({ error: 'User not found' });
    }
};

export const getApps = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const user = await Users.findOne({where: {id : Number(userId)}});
        if (user) {
            const apps = await Apps.find({ where: { user } });
            res.status(200).send({ apps });
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
};

export const assignApiToApp = async (req: Request, res: Response) => {
    const { userId, appId, apiId } = req.body;

    const user = await Users.findOne(userId);
    const app = await Apps.findOne(appId);

    if (user && app && validateSubscription(user.subscriptionPlan, apiId)) {
        // Logic to assign API to the app
        res.status(200).send({ success: true });
    } else {
        res.status(400).send({ error: 'Invalid request' });
    }
};
