import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = 'your_secret_key'; // Use a strong, unique key for production

export interface AuthenticatedRequest extends Request {
    user?: any;
    id?: any;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Token Required' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid Access Token' });
    }
};
