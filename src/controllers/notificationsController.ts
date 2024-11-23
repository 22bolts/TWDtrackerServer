import { Request, Response } from 'express';
import { Users } from '../Entities/Users';
import { Notifications } from '../Entities/Notifications';

export const createNotification = async (req: Request, res: Response) => {
    console.log("Trying to notify user");
    const { userId, title, message } = req.body;

    try {
        const user = await Users.findOne({where: {id: userId}});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const notification = new Notifications();
        notification.message = message;
        notification.user = user;
        notification.title = title;
        await notification.save();

        res.status(201).json(notification);
    } catch (error: any) {
        console.log("Error notifying:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getUserNotifications = async (req: Request, res: Response) => {
    const userId = req.params.userId;

    try {
        const notifications = await Notifications.find({ where: { user: { id: Number(userId) } } });
        res.status(200).json(notifications);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUnreadNotificationsCount = async (req: Request, res: Response) => {
    const userId = req.params.userId;

    try {
        const count = await Notifications.count({ where: { user: { id: Number(userId) }, read: false } });
        res.status(200).json({ unreadCount: count });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
    const notificationId = req.params.notificationId;

    try {
        const notification = await Notifications.findOne({where: {id: Number(notificationId)}});
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json(notification);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    const notificationId = req.params.notificationId;

    try {
        const notification = await Notifications.findOne({where: {id: Number(notificationId)}});
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await Notifications.remove(notification);

        res.status(200).json({ message: 'Notification deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const clearUserNotifications = async (req: Request, res: Response) => {
    const userId = req.params.userId;

    try {
        await Notifications.delete({ user: { id: Number(userId) } });

        res.status(200).json({ message: 'All notifications cleared' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};