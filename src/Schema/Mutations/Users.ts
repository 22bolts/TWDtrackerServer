import { GraphQLFloat, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { UserType } from "../TypeDefs/Users";
import { Users } from "../../Entities/Users";
import { Employees } from "../../Entities/Employees";
import { Freelancers } from "../../Entities/Freelancers";
import { Clients } from "../../Entities/Clients";
import { getRepository } from "typeorm";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Trainers } from "../../Entities/Trainers";

const SECRET_KEY = "your_secret_key";

export const CREATE_USER = {
    type: UserType,
    args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        phone_number: { type: GraphQLString },
        role: { type: new GraphQLNonNull(GraphQLString) },
        first_name: { type: new GraphQLNonNull(GraphQLString) },
        middle_name: { type: GraphQLString },
        last_name: { type: new GraphQLNonNull(GraphQLString) },
        usertag: { type: new GraphQLNonNull(GraphQLString) },
        status: { type: GraphQLString },
        avatar: { type: GraphQLString },
        department: { type: GraphQLString }, // For employees
        position: { type: GraphQLString }, // For employees
        managerID: { type: GraphQLID }, // For employees
        skills: { type: new GraphQLList(GraphQLString) }, // For freelancers
        portfolio_Link: { type: GraphQLString }, // For freelancers
        availabilityStatus: { type: GraphQLString }, // For freelancers
        hourly_Rate: { type: GraphQLFloat }, // For freelancers
        companyName: { type: GraphQLString }, // For clients
        address: { type: GraphQLString }, // For clients
    },
    async resolve(parent: any, args: any) {
        const requiredFields = ['email', 'password', 'role', 'first_name', 'last_name', 'usertag'];
        const missingFields = requiredFields.filter(field => !(field in args));
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        const { email, password, phone_number, role, first_name, middle_name, last_name, usertag, status, avatar } = args;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await Users.create({
                email,
                password: hashedPassword,
                phone_number,
                role,
                first_name,
                middle_name,
                last_name,
                avatar
            }).save();

            if (role.toUpperCase() === 'EMPLOYEE') {
                const { position, managerID, department } = args;
                const employee = await Employees.create({
                    userID: user.id,
                    position,
                    salary: 0, // Default salary, adjust as needed
                }).save();
                user.employee = employee;
            } else if (role.toUpperCase() === 'TRAINER') {
                const { companyName, address } = args;
                const trainer = await Trainers.create({
                    userID: user.id,
                }).save();
                user.trainer = trainer;
            }
            else if (role.toUpperCase() === 'CLIENT') {
                const { companyName, address } = args;
                const client = await Clients.create({
                    userID: user.id,
                    address,
                }).save();
                user.client = client;
            }

            // Generate auth token
            const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

            return { user, token };
        } catch (error) {
            console.error("Failed to create user:", error);
            throw new Error("Unable to create user at this time. Please try again later.");
        }
    },
};


export const SIGN_IN = {
    type: UserType,
    args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(parent: any, args: any) {
        const { email, password } = args;

        const requiredFields = ['email', 'password'];
        const missingFields = requiredFields.filter(field => !(field in args));
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        try {
            const user = await getRepository(Users).findOne({ where: { email } });

            if (!user) {
                throw new Error("User not found");
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new Error("Incorrect password");
            }

            const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

            return { user, token };
        } catch (error: any) {
            console.error("Failed to sign in:", error);
            throw new Error(error.message);
        }
    },
};
