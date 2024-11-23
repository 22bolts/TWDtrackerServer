import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Ensure chat directory exists
const CHAT_DIR = path.join(__dirname, '../chats');
if (!fs.existsSync(CHAT_DIR)) {
    fs.mkdirSync(CHAT_DIR);
}

// Utility function to get chat file path
const getChatFilePath = (userId: string, chatUserId: string) => {
    const userDir = path.join(CHAT_DIR, userId);
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
    }
    return path.join(userDir, `${chatUserId}.json`);
};

export const sendMessage = async (req: Request, res: Response) => {
    const { userId, chatUserId, message } = req.body;
    const filePath = getChatFilePath(userId, chatUserId);

    const timestamp = new Date().toISOString();
    const newMessage = { sender: userId, message, timestamp };

    let chatData = [];
    if (fs.existsSync(filePath)) {
        chatData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    chatData.push(newMessage);

    fs.writeFileSync(filePath, JSON.stringify(chatData, null, 2));
    return res.status(200).json(newMessage);
};

export const getMessages = async (req: Request, res: Response) => {
    const { userId, chatUserId } = req.params;
    const filePath = getChatFilePath(userId, chatUserId);

    if (fs.existsSync(filePath)) {
        const chatData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return res.status(200).json(chatData.slice(-30)); // Get the last 30 messages
    } else {
        return res.status(200).json([]);
    }
};

export const editMessage = async (req: Request, res: Response) => {
    const { userId, chatUserId, timestamp, newMessage } = req.body;
    const filePath = getChatFilePath(userId, chatUserId);

    if (fs.existsSync(filePath)) {
        let chatData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        chatData = chatData.map((msg: any) => {
            if (msg.sender === userId && msg.timestamp === timestamp) {
                return { ...msg, message: newMessage, edited: true };
            }
            return msg;
        });

        fs.writeFileSync(filePath, JSON.stringify(chatData, null, 2));
        return res.status(200).json({ message: 'Message edited' });
    } else {
        return res.status(404).json({ message: 'Chat not found' });
    }
};
