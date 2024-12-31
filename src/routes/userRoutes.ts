import { Router, Request, Response } from 'express';
import { Users } from '../Entities/Users';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Clients } from '../Entities/Clients';
import { Freelancers } from '../Entities/Freelancers';
import { Employees } from '../Entities/Employees';
import { PasswordOTP } from '../Entities/PasswordOTP';
import { authenticateJWT } from '../middlewares/authMiddleware';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Trainers } from '../Entities/Trainers';
import { MoreThan } from 'typeorm';

const secretKey = 'your_secret_key';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '../uploads/profile');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type'));
    }
});

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isStrongPassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

interface EmailError {
    message: string;
    code?: string;
    command?: string;
}

// Modified signup route with validation
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, phone_number, role, full_name, avatar, position, salary } = req.body;

        // Check if required fields are present
        const requiredFields = ['email', 'password', 'role', 'full_name'];
        const missingFields = requiredFields.filter(field => !req.body[field]?.trim());
        if (missingFields.length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if email already exists
        const existingUser = await Users.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Validate password strength
        // if (!isStrongPassword(password)) {
        //     return res.status(400).json({ 
        //         message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
        //     });
        // }

        // Validate phone number if provided
        if (phone_number) {
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            if (!phoneRegex.test(phone_number)) {
                return res.status(400).json({ message: 'Invalid phone number format' });
            }
        }

        // Validate role
        const validRoles = ['client', 'employee', 'trainer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Rest of your existing signup logic...
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = Users.create({
            email,
            password: hashedPassword,
            phone_number,
            role,
            full_name: full_name.trim(),
            avatar
        });

        await user.save();

        if(role == "client"){
            const client = Clients.create({
                // userID: user.id,
                user: user,
                phone: phone_number
            });
    
            await client.save();
        }else if(role == "employee"){
            const employee = Employees.create({
                // userID: user.id,
                user: user,
                position: position || "default position",
                salary
            });
    
            await employee.save();
        }
        else if(role == "trainer"){
            const employee = Trainers.create({
                // userID: user.id,
                user: user,
            });
    
            await employee.save();
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secretKey, { expiresIn: '1h' });

        res.json({ token, data:{id: user.id, full_name: user.full_name, email: user.email,
            role: user.role, phone_number: user.phone_number, avatar: user.avatar, purchased: user.purchased} });
    } catch (error) {
        res.status(500).json({ message: 'Unable to create user', error });
    }
});

router.post('/signin', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if required fields are present
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and Password are required' });
        }

        const user = await Users.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords (Assuming passwords are hashed)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secretKey, { expiresIn: '1h' });

        res.json({ token, data:{id: user.id, full_name: user.full_name, email: user.email,
            role: user.role, phone_number: user.phone_number, avatar: user.avatar, purchased: user.purchased} });
    } catch (error) {
        res.status(500).json({ message: 'Unable to login', error });
        console.log("ERROR SIGNING IN:", error);
    }
});

// Email sending function with proper error handling and typing
const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.HOSTINGER_EMAIL,
                pass: process.env.HOSTINGER_PASSWORD,
            },
            // Add timeout to prevent hanging
            tls: {
                rejectUnauthorized: true, // Verify SSL/TLS certificate
            },
            connectionTimeout: 10000, // 10 seconds
            socketTimeout: 20000, // 20 seconds
        });

        // Verify SMTP connection configuration
        await transporter.verify();

        const mailOptions = {
            from: {
                name: 'TWDTracker',
                address: process.env.HOSTINGER_EMAIL!, // Use authenticated email as sender
            },
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}\nThis code will expire in 10 minutes.`,
            html: `
                <h2>Password Reset OTP</h2>
                <p>Your OTP for password reset is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        
        // Check if email was actually sent
        if (!info.messageId) {
            throw new Error('No messageId received from SMTP server');
        }

        return true;
    } catch (error) {
        console.error('Detailed email sending error:', {
            error,
            timestamp: new Date().toISOString(),
            recipient: email,
        });
        throw error;
    }
};

// Generate OTP for password reset with improved error handling
router.post('/generate-reset-otp', async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email?.trim()) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Improved email validation regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        const user = await Users.findOne({ where: { email } });
        
        // Generic response for non-existent users
        if (!user) {
            return res.status(200).json({
                message: 'If an account exists with this email, you will receive an OTP shortly.'
            });
        }

        // Rate limiting with more detailed response
        const recentOTP = await PasswordOTP.findOne({
            where: {
                userId: user.id,
                createdAt: MoreThan(new Date(Date.now() - 5 * 60 * 1000))
            }
        });

        if (recentOTP) {
            const timeLeft = Math.ceil((recentOTP.createdAt.getTime() + 5 * 60 * 1000 - Date.now()) / 1000 / 60);
            return res.status(429).json({
                message: `Please wait ${timeLeft} minutes before requesting another OTP`,
                retryAfter: timeLeft * 60 // seconds
            });
        }

        // Generate a cryptographically secure OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Clean up old OTPs first
        await PasswordOTP.delete({ userId: user.id });

        // Create new OTP record
        const passwordOTP = PasswordOTP.create({
            userId: user.id,
            email,
            otp,
            expiresAt,
        });
        await passwordOTP.save();

        // Send email with proper error handling
        try {
            await sendOTPEmail(email, otp);
            
            return res.status(200).json({
                message: 'OTP sent successfully. Please check your email.',
                expiresIn: '10 minutes'
                // Remove otp from response in production
            });
        } catch (error) {
            // Delete the OTP record if email fails
            await passwordOTP.remove();

            
            const emailError = error as EmailError;
            
            console.error('Failed to send OTP email:', {
                error: emailError,
                userId: user.id,
                timestamp: new Date().toISOString()
            });
            
            return res.status(500).json({ 
                message: 'Failed to send OTP email. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
            });
        }
    } catch (error) {
        console.error('Error in OTP generation:', {
            error,
            email,
            timestamp: new Date().toISOString()
        });
        
        return res.status(500).json({ 
            message: 'Server error while generating OTP'
        });
    }
});

// Reset password using OTP
router.post('/reset-password', async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ 
            message: 'Email, OTP, and new password are required' 
        });
    }

    try {
        // Find the OTP record
        const otpRecord = await PasswordOTP.findOne({
            where: { 
                email,
                otp
            }
        });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await PasswordOTP.delete({ id: otpRecord.id });
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Find user and update password
        const user = await Users.findOne({ where: { id: otpRecord.userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Delete the used OTP
        await PasswordOTP.delete({ id: otpRecord.id });

        res.status(200).json({ 
            message: 'Password reset successful' 
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error while resetting password' });
    }
});

// Protect all routes below with JWT middleware
// router.use(authenticateJWT);

router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await Users.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Unable to get users', error });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await Users.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Unable to get user', error });
    }
});

router.get('/user/purchased-count/:userId', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId, 10); // Convert string to number

        // Validate if userId is provided and is a valid number
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: 'Valid User ID is required' });
        }

        // Find the user and their purchase count
        const user = await Users.findOne({
            where: { id: userId },
            select: ['id', 'purchased']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the purchase count
        res.json({ 
            userId: user.id,
            purchasedCount: user.purchased || 0
        });

    } catch (error: any) { // Type assertion for error
        res.status(500).json({ 
            message: 'Error fetching purchase count', 
            error: error?.message || 'Unknown error'
        });
    }
});

router.put('/:id', upload.single('avatar'), async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await Users.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { email, phone_number, full_name, isAvatarUpdated } = req.body;
        const updates: Partial<Users> = {};

        // Update other user details if provided
        if (email) updates.email = email;
        if (phone_number) updates.phone_number = phone_number;
        if (full_name) updates.full_name = full_name;

        // Update avatar only if isAvatarUpdated flag is true and a file is provided
        if (isAvatarUpdated === 'true' && req.file) {
            const avatarPath = `/uploads/profile/${req.file.filename}`;
            updates.avatar = avatarPath;

            // Delete old avatar file if it exists
            if (user.avatar) {
                const oldAvatarPath = path.join(__dirname, '..', '..', user.avatar);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }
        }

        // Update user details in the database
        await Users.update(userId, updates);

        // Fetch updated user
        const updatedUser = await Users.findOne({ where: { id: userId } });

        // Generate a new JWT token with updated details
        const token = jwt.sign(
            { id: updatedUser!.id, email: updatedUser!.email, role: updatedUser!.role },
            secretKey,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            data: {
                id: updatedUser!.id,
                full_name: updatedUser!.full_name,
                email: updatedUser!.email,
                role: updatedUser!.role,
                phone_number: updatedUser!.phone_number,
                avatar: updatedUser!.avatar,
            },
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Unable to update user', error });
    }
});



router.delete('/:id', async (req: any, res: Response) => {
    try {
        await Users.delete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Unable to delete user', error });
    }
});


router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.file;
        const fileUrl = `/uploads/profile/${file.filename}`;

        console.log({ message: 'File uploaded successfully', fileUrl });
        res.json({ message: 'File uploaded successfully', fileUrl });
    } catch (error) {
        res.status(500).json({ message: 'Unable to upload file', error });
    }
});

// router.post('/set-pin', async (req, res) => {
//     const { email, pin } = req.body;

//     if (!email || !pin) {
//         return res.status(400).json({ message: 'Email and PIN are required' });
//     }

//     if (pin.length !== 4 || !/^\d+$/.test(pin)) {
//         return res.status(400).json({ message: 'PIN must be a 4-digit number' });
//     }

//     try {
//         const user = await Users.findOne({ where: { email } });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const hashedPin = await bcrypt.hash(pin, 10); // Hash the PIN with bcrypt

//         user.hashedPin = hashedPin;

//         await user.save();

//         res.status(200).json({ message: 'PIN set successfully' });
//     } catch (error) {
//         console.error('Error setting PIN:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// Route to verify existing PIN
router.post('/pin/verify-pin', async (req, res) => {
    const { email, pin } = req.body;

    if (!email || !pin) {
        return res.status(400).json({ message: 'Email and PIN are required' });
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        return res.status(400).json({ message: 'PIN must be a 4-digit number' });
    }

    try {
        const user = await Users.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.hashedPin) {
            return res.status(400).json({ message: 'PIN not set for this user' });
        }

        const isPinValid = await bcrypt.compare(pin, user.hashedPin);

        if (!isPinValid) {
            return res.status(401).json({ message: 'Invalid PIN' });
        }

        res.status(200).json({ message: 'PIN verified successfully' });
    } catch (error) {
        console.error('Error verifying PIN:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to set initial PIN (keeping your existing route)
router.post('/pin/set-pin', async (req, res) => {
    const { email, pin } = req.body;

    if (!email || !pin) {
        return res.status(400).json({ message: 'Email and PIN are required' });
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        return res.status(400).json({ message: 'PIN must be a 4-digit number' });
    }

    try {
        const user = await Users.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPin = await bcrypt.hash(pin, 10);
        user.hashedPin = hashedPin;
        await user.save();

        res.status(200).json({ message: 'PIN set successfully' });
    } catch (error) {
        console.error('Error setting PIN:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to update existing PIN
router.post('/pin/update-pin', async (req, res) => {
    const { email, currentPin, newPin } = req.body;

    if (!email || !currentPin || !newPin) {
        return res.status(400).json({ message: 'Email, current PIN, and new PIN are required' });
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
        return res.status(400).json({ message: 'New PIN must be a 4-digit number' });
    }

    try {
        const user = await Users.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.hashedPin) {
            return res.status(400).json({ message: 'No PIN currently set' });
        }

        // Verify current PIN
        const isPinValid = await bcrypt.compare(currentPin, user.hashedPin);

        if (!isPinValid) {
            return res.status(401).json({ message: 'Current PIN is incorrect' });
        }

        // Hash and save new PIN
        const hashedNewPin = await bcrypt.hash(newPin, 10);
        user.hashedPin = hashedNewPin;
        await user.save();

        res.status(200).json({ message: 'PIN updated successfully' });
    } catch (error) {
        console.error('Error updating PIN:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all employees with user details
router.get('/role/employees', async (req: Request, res: Response) => {
    try {
        const employees = await Employees.createQueryBuilder('employee')
            .leftJoinAndSelect('employee.user', 'user')
            .select([
                'employee.id',
                'employee.position',
                'employee.salary',
                'user.id',
                'user.email',
                'user.full_name',
                'user.phone_number',
                'user.avatar',
                'user.role'
            ])
            .getMany();

        if (!employees.length) {
            return res.status(200).json({ message: 'No employees found', data: [] });
        }

        res.status(200).json({
            message: 'Employees retrieved successfully',
            data: employees
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ 
            message: 'Unable to fetch employees',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

// Route to get a single employee by ID
router.get('/employees/:id', async (req: Request, res: Response) => {
    try {
        const employeeId = parseInt(req.params.id, 10);
        if (isNaN(employeeId)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }

        const employee = await Employees.find({ 
            where: { id: employeeId }, 
            relations: ['user'] 
        });
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Unable to fetch employee', error });
    }
});

// Get all trainers with user details
router.get('/role/trainers', async (req: Request, res: Response) => {
    try {
        const trainers = await Trainers.createQueryBuilder('trainer')
            .leftJoinAndSelect('trainer.user', 'user')
            .select([
                'trainer.id',
                'user.id',
                'user.email',
                'user.full_name',
                'user.phone_number',
                'user.avatar',
                'user.role',
                'user.completed'
            ])
            .getMany();

        if (!trainers.length) {
            return res.status(200).json({ message: 'No trainers found', data: [] });
        }

        res.status(200).json({
            message: 'Trainers retrieved successfully',
            data: trainers
        });
    } catch (error) {
        console.error('Error fetching trainers:', error);
        res.status(500).json({ 
            message: 'Unable to fetch trainers',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});


// Get all clients with user details
router.get('/role/clients', async (req: Request, res: Response) => {
    try {
        const clients = await Clients.createQueryBuilder('client')
            .leftJoinAndSelect('client.user', 'user')
            .select([
                'client.id',
                'client.phone',
                'user.id',
                'user.email',
                'user.full_name',
                'user.phone_number',
                'user.avatar',
                'user.role',
                'user.purchased',
                'user.completed'
            ])
            .getMany();

        if (!clients.length) {
            return res.status(200).json({ message: 'No clients found', data: [] });
        }

        res.status(200).json({
            message: 'Clients retrieved successfully',
            data: clients
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ 
            message: 'Unable to fetch clients',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

// Get single client by ID
router.get('/role/clients/:id', async (req: Request, res: Response) => {
    try {
        const clientId = parseInt(req.params.id, 10);
        if (isNaN(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        const client = await Clients.createQueryBuilder('client')
            .leftJoinAndSelect('client.user', 'user')
            .select([
                'client.id',
                'client.phone',
                'user.id',
                'user.email',
                'user.full_name',
                'user.phone_number',
                'user.avatar',
                'user.role',
                'user.purchased',
                'user.completed'
            ])
            .where('client.id = :id', { id: clientId })
            .getOne();

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).json({
            message: 'Client retrieved successfully',
            data: client
        });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ 
            message: 'Unable to fetch client',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

// Get single trainer by ID
router.get('/role/trainers/:id', async (req: Request, res: Response) => {
    try {
        const trainerId = parseInt(req.params.id, 10);
        if (isNaN(trainerId)) {
            return res.status(400).json({ message: 'Invalid trainer ID' });
        }

        const trainer = await Trainers.createQueryBuilder('trainer')
            .leftJoinAndSelect('trainer.user', 'user')
            .select([
                'trainer.id',
                'user.id',
                'user.email',
                'user.full_name',
                'user.phone_number',
                'user.avatar',
                'user.role',
                'user.completed'
            ])
            .where('trainer.id = :id', { id: trainerId })
            .getOne();

        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        res.status(200).json({
            message: 'Trainer retrieved successfully',
            data: trainer
        });
    } catch (error) {
        console.error('Error fetching trainer:', error);
        res.status(500).json({ 
            message: 'Unable to fetch trainer',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

// Update the client-trainer relationship endpoints
router.get('/role/clients/:userId/trainers', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await Users.createQueryBuilder('user')
            .leftJoinAndSelect('user.client', 'client')
            .where('user.id = :id', { id: userId })
            .getOne();

        if (!user || !user.client) {
            return res.status(404).json({ message: 'Client not found for the provided user ID' });
        }

        const clientId = user.client.id;

        const client = await Clients.createQueryBuilder('client')
            .leftJoinAndSelect('client.trainers', 'trainer')
            .leftJoinAndSelect('trainer.user', 'user')
            .where('client.id = :id', { id: clientId })
            .getOne();

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).json({ trainers: client.trainers });
    } catch (error) {
        console.error('Error fetching trainers for client:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/role/trainers/:userId/clients', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await Users.createQueryBuilder('user')
            .leftJoinAndSelect('user.trainer', 'trainer')
            .where('user.id = :id', { id: userId })
            .getOne();

        if (!user || !user.trainer) {
            return res.status(404).json({ message: 'Trainer not found for the provided user ID' });
        }

        const trainerId = user.trainer.id;

        const trainer = await Trainers.createQueryBuilder('trainer')
            .leftJoinAndSelect('trainer.clients', 'client')
            .leftJoinAndSelect('client.user', 'user')
            .where('trainer.id = :id', { id: trainerId })
            .getOne();

        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        res.status(200).json({ clients: trainer.clients });
    } catch (error) {
        console.error('Error fetching clients for trainer:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


export { router as userRouter };
