// src/server.ts
import express, { Application, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { json } from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { userRouter } from './routes/userRoutes';
import dotenv from 'dotenv';

// Import the entities
import { Users } from './Entities/Users';
import { Employees } from './Entities/Employees';
import { Clients } from './Entities/Clients';

import fs from 'fs';
import path from 'path';
import { Socket } from 'dgram';

import jwt from 'jsonwebtoken';
import { Trainers } from './Entities/Trainers';
import { OTP } from './Entities/OTP';
import { Sessions } from './Entities/Sessions';
import { sessionRouter } from './routes/sessionsRoutes';

const chatBasePath = path.join(__dirname, '..', 'chatMessages');

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        await createConnection({
            type: 'postgres',
            host: 'svgjfhsqggolnipsgzjz.db.eu-central-1.nhost.run', // Extracted from the connection string
            port: 5432, // Default PostgreSQL port
            username: 'postgres', // From the connection string
            password: 'bD73V7JGVap2s5pr', // Replace with the actual password from your connection string
            database: 'svgjfhsqggolnipsgzjz', // From the connection string
            entities: [
                Employees, Trainers, Users, Clients, OTP, Sessions
            ],
            synchronize: true, // Set to false in production
            logging: true,
            schema: "public"
        });
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Exit process with failure
    }
};

// Initialize Express application
const app: Application = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use('/api/users', userRouter);
app.use('/api/sessions', sessionRouter);

app.get('/api/get-token', (req, res) => {
    const API_KEY = '9fe47244-ae0a-4308-bb5f-ab3434d0c37d';
    const SECRET = '44b81290fc3229b820cbd811763b61a51ff0ef84d4ebd78afa09bbaad5db22a0';

    const payload = {
        apikey: API_KEY,
        permissions: ['allow_join'], // `ask_join` || `allow_mod`
        version: 2,
        roomId: '2kyv-gzay-64pg', // OPTIONAL
        participantId: 'lxvdplwt', // OPTIONAL 
        roles: ['crawler', 'rtc'], // OPTIONAL
    };

    const options = { 
        expiresIn: '120m', 
        algorithm: 'HS256'
    };

    try {
        
        const token = jwt.sign(payload, SECRET, { expiresIn: '120m', algorithm: 'HS256' });
        console.log("Token stuff is:", token);
        res.json({ token });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

const API_KEY = '9fe47244-ae0a-4308-bb5f-ab3434d0c37d';
const SECRET_KEY = '44b81290fc3229b820cbd811763b61a51ff0ef84d4ebd78afa09bbaad5db22a0';


app.post('/get-token', (req, res) => {
    const payload = {
      apikey: API_KEY,
      permissions: ['allow_join', 'allow_mod'], // Add permissions as needed
      version: 2,
      roomId: req.body.roomId || Math.random().toString(36).substring(2, 7),
      participantId: req.body.participantId || Math.random().toString(36).substring(2, 7)
    };
  
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });
});

// Default route
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to EverythingCodes API');
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Track online users
const onlineUsers = new Map<string, string>();

// Helper functions
const ensureDirectoryExistence = (filePath: string) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
};

const appendMessageToFile = (filePath: string, message: object) => {
    let messages: object[] = [];
    if (fs.existsSync(filePath)) {
        messages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    messages.push(message);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
};

interface CallData {
    signalData: any;
    userId: string;
    recipientId?: string;
    callId?: string;
}

const calls = new Map<string, CallData[]>();

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await connectDB();
});

const getChatFilePath = (userId: string, recipientId: string): string => {
    return path.join(chatBasePath, userId, `${recipientId}.json`);
};
