import express from 'express';
import { createNotification, getUserNotifications, markNotificationAsRead, deleteNotification, clearUserNotifications, getUnreadNotificationsCount } from '../controllers/notificationsController';

const router = express.Router();

router.post('/', createNotification);
router.get('/users/:userId/notifications', getUserNotifications);
router.get('/users/:userId/unread-count', getUnreadNotificationsCount);
router.patch('/:notificationId/read', markNotificationAsRead);
router.delete('/:notificationId', deleteNotification);
router.delete('/users/:userId/notifications', clearUserNotifications);

export {router as notificationRoutes};
