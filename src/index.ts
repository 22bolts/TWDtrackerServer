import express, { Application } from "express";
import { Request, Response, NextFunction } from 'express';

import { ApolloServer } from "apollo-server-express";
import multer from "multer";
// import nodemailer from "nodemailer";
// import nodemailer from 'nodemailer'
// import Mail from "nodemailer/lib/mailer";
// import nodemailer from 'nodemailer';
import nodemailer from 'nodemailer';

import { fileStorage, fileFilter } from "./config/multer";

import { schema } from "./Schema";

import cors from 'cors'
import { createConnection } from "typeorm";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

//  Tables
import { Users } from "./Entities/Users";
import { Employees } from "./Entities/Employees";
import { Freelancers } from "./Entities/Freelancers";
import { Clients } from "./Entities/Clients";
import { Instructors } from "./Entities/Instructors";
import { Services } from "./Entities/Services";
import { Orders } from "./Entities/Orders";
import { Transactions } from "./Entities/Transactions";
import { Discounts } from "./Entities/Discounts";
import { Courses } from "./Entities/Courses";
import { APIOrders } from "./Entities/APIOrders";
import { APITemplates } from "./Entities/APITemplates";
import { APIUsers } from "./Entities/APIUsers";



const main = async () => {
    await createConnection({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'everythingcodesDB',
        username: 'postgres',
        password: '1234567890',
        logging: true,
        synchronize: false,
        entities: [Users, Employees, Freelancers, Clients,
            Instructors, Courses, Services, Orders, Transactions, Discounts, APIOrders, APITemplates, APIUsers]
    })
    const app: Application = express();
    app.use(cors())
    app.use(express.json())

    // Route for file upload using the Multer configurations
    const upload = multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'); // Use single() for a single file upload

    // app.post('/upload', (req: Request, res: Response, next: NextFunction) => {
    //     upload(req, res, (err: any) => {
    //         if (err) {
    //             // Handle multer error
    //             console.log({error: err.message})
    //             return res.status(400).json({ error: err.message });
    //         }
    //         // File uploaded successfully
    //         res.status(200).json({ message: 'File uploaded successfully!' });
    //     });
    // });

    app.post('/upload', (req: any, res: Response, next: NextFunction) => {
        upload(req, res, (err: any) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            // Assuming the file is saved in the 'uploads' directory
            const filePath = `uploads/${req.file.filename}`;
            res.status(200).json({ message: 'File uploaded successfully!', filePath });
        });
    });

    
    // Serve static files from the 'uploads' directory
    app.use('/uploads', express.static('uploads'));

    // Email sending setup
    app.post('/send-email', async (req: Request, res: Response) => {
        const { name, email, phone, message } = req.body;
    
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
    
        const mailOptions = {
          from: email,
          to: 'bguy00504@gmail.com', // Replace with the recipient's email address
          subject: `Message from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
        };
    
        try {
          await transporter.sendMail(mailOptions);
          res.status(200).json({ message: 'Email sent successfully!' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to send email' });
        }
    });
    

    // Create an instance of ApolloServer
    const server = new ApolloServer({schema,});

    // Apply the Apollo GraphQL middleware to your Express app
    await server.start();
    server.applyMiddleware({ app : app as any, path: '/graphql' });

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

main().catch((err) => {
    console.log(err);
})