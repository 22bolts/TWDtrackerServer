import { Router, Request, Response } from 'express';
import { Users } from '../Entities/Users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Clients } from '../Entities/Clients';
import { Freelancers } from '../Entities/Freelancers';
import { Employees } from '../Entities/Employees';
import { authenticateJWT } from '../middlewares/authMiddleware';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Trainers } from '../Entities/Trainers';

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

router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, phone_number, role, first_name, full_name,
            middle_name, last_name, avatar, position, salary } = req.body;

        // Check if required fields are present
        const requiredFields = ['email', 'password', 'role', 'full_name'];
        const missingFields = requiredFields.filter(field => !(field in req.body));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = Users.create({
            email,
            password: hashedPassword,
            phone_number,
            role,
            full_name,
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
            role: user.role, phone_number: user.phone_number, avatar: user.avatar} });
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
            role: user.role, phone_number: user.phone_number, avatar: user.avatar} });
    } catch (error) {
        res.status(500).json({ message: 'Unable to login', error });
        console.log("ERROR SIGNING IN:", error);
    }
});

router.get('/freelancers', async (req: Request, res: Response) => {
    try {
        const freelancer = await Freelancers.find({ relations: ["user"] });
        res.json(freelancer);
    } catch (error) {
        res.status(500).json({ message: 'Unable to get users', error });
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

// router.put('/:id', async (req: any, res: Response) => {
//     try {
//         await Users.update(req.params.id, req.body);
//         const user = await Users.findOne({ where: {id: req.params.id}});
        
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secretKey, { expiresIn: '1h' });

//         res.json({ token, data:{id: user.id, full_name: user.full_name, email: user.email,
//             role: user.role, phone_number: user.phone_number, avatar: user.avatar} });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Unable to update user', error });
//     }
// });

// router.put('/:id', upload.single('avatar'), async (req: Request, res: Response) => {
//     try {
//         const userId = parseInt(req.params.id, 10);
//         if (isNaN(userId)) {
//             return res.status(400).json({ message: 'Invalid user ID' });
//         }

//         const user = await Users.findOne({ where: { id: userId } });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const { email, phone_number, full_name } = req.body;
//         const updates: Partial<Users> = {};

//         if (email) updates.email = email;
//         if (phone_number) updates.phone_number = phone_number;
//         if (full_name) updates.full_name = full_name;

//         // Handle avatar update if file is provided
//         if (req.file) {
//             const avatarPath = `/uploads/profile/${req.file.filename}`;
//             updates.avatar = avatarPath;

//             // Delete old avatar file if it exists
//             if (user.avatar) {
//                 const oldAvatarPath = path.join(__dirname, '..', '..', user.avatar);
//                 if (fs.existsSync(oldAvatarPath)) {
//                     fs.unlinkSync(oldAvatarPath);
//                 }
//             }
//         }

//         // Update user details
//         await Users.update(userId, updates);

//         // Fetch updated user
//         const updatedUser = await Users.findOne({ where: { id: userId } });

//         // Generate a new JWT token with updated details
//         const token = jwt.sign(
//             { id: updatedUser!.id, email: updatedUser!.email, role: updatedUser!.role },
//             secretKey,
//             { expiresIn: '1h' }
//         );

//         res.json({
//             token,
//             data: {
//                 id: updatedUser!.id,
//                 full_name: updatedUser!.full_name,
//                 email: updatedUser!.email,
//                 role: updatedUser!.role,
//                 phone_number: updatedUser!.phone_number,
//                 avatar: updatedUser!.avatar,
//             },
//         });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ message: 'Unable to update user', error });
//     }
// });

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

router.post('/set-pin', async (req, res) => {
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

        const hashedPin = await bcrypt.hash(pin, 10); // Hash the PIN with bcrypt

        user.hashedPin = hashedPin;

        await user.save();

        res.status(200).json({ message: 'PIN set successfully' });
    } catch (error) {
        console.error('Error setting PIN:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get all trainers
router.get('/trainers', async (req: Request, res: Response) => {
    try {
        const trainers = await Trainers.find({ relations: ['user'] });
        res.status(200).json(trainers);
    } catch (error) {
        res.status(500).json({ message: 'Unable to fetch trainers', error });
    }
});

// Route to get all clients
router.get('/clients', async (req: Request, res: Response) => {
    try {
        const clients = await Clients.find({ relations: ['user'] });
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Unable to fetch clients', error });
    }
});

// Route to get a single trainer by ID
router.get('/trainers/:id', async (req: Request, res: Response) => {
    try {
        const trainerId = parseInt(req.params.id, 10);
        if (isNaN(trainerId)) {
            return res.status(400).json({ message: 'Invalid trainer ID' });
        }

        const trainer = await Trainers.findOne({ where: { id: trainerId }, relations: ['user'] });
        if (!trainer) {
            return res.status(404).json({ message: 'Trainer not found' });
        }

        res.status(200).json(trainer);
    } catch (error) {
        res.status(500).json({ message: 'Unable to fetch trainer', error });
    }
});

// Route to get a single client by ID
router.get('/clients/:id', async (req: Request, res: Response) => {
    try {
        const clientId = parseInt(req.params.id, 10);
        if (isNaN(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        const client = await Clients.findOne({ where: { id: clientId }, relations: ['user'] });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        // const user = await Users.findOne({ where: { id: client.userID }, relations: ['user'] });
        // if (!client) {
        //     return res.status(404).json({ message: 'Client not found' });
        // }

        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: 'Unable to fetch client', error });
    }
});

// router.get('/clients/:clientId/trainers', async (req, res) => {
//     const { clientId } = req.params;

//     try {
//         // Fetch client with trainers
//         const client = await Clients.createQueryBuilder('client')
//             .leftJoinAndSelect('client.trainers', 'trainer')
//             .leftJoinAndSelect('trainer.user', 'user') // Include user data
//             .where('client.id = :id', { id: clientId })
//             .getOne();

//         if (!client) {
//             return res.status(404).json({ message: 'Client not found' });
//         }

//         // Return the trainers
//         res.status(200).json({ trainers: client.trainers });
//     } catch (error) {
//         console.error('Error fetching client trainers:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

router.get('/clients/:userId/trainers', async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch the client ID from the Users table
        const user = await Users.createQueryBuilder('user')
            .leftJoinAndSelect('user.client', 'client') // Join client
            .where('user.id = :id', { id: userId })
            .getOne();

        if (!user || !user.client) {
            return res.status(404).json({ message: 'Client not found for the provided user ID' });
        }

        const clientId = user.client.id;

        // Fetch trainers for the client
        const client = await Clients.createQueryBuilder('client')
            .leftJoinAndSelect('client.trainers', 'trainer')
            .leftJoinAndSelect('trainer.user', 'user') // Include user data
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

// router.get('/trainers/:trainerId/clients', async (req, res) => {
//     const { trainerId } = req.params;

//     try {
//         // Fetch trainer with clients
//         const trainer = await Trainers.createQueryBuilder('trainer')
//             .leftJoinAndSelect('trainer.clients', 'client')
//             .leftJoinAndSelect('client.user', 'user') // Include user data
//             .where('trainer.id = :id', { id: trainerId })
//             .getOne();

//         if (!trainer) {
//             return res.status(404).json({ message: 'Trainer not found' });
//         }

//         // Return the clients
//         res.status(200).json({ clients: trainer.clients });
//     } catch (error) {
//         console.error('Error fetching trainer clients:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

router.get('/trainers/:userId/clients', async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch the trainer ID from the Users table
        const user = await Users.createQueryBuilder('user')
            .leftJoinAndSelect('user.trainer', 'trainer') // Join trainer
            .where('user.id = :id', { id: userId })
            .getOne();

        if (!user || !user.trainer) {
            return res.status(404).json({ message: 'Trainer not found for the provided user ID' });
        }

        const trainerId = user.trainer.id;

        // Fetch clients for the trainer
        const trainer = await Trainers.createQueryBuilder('trainer')
            .leftJoinAndSelect('trainer.clients', 'client')
            .leftJoinAndSelect('client.user', 'user') // Include user data
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
