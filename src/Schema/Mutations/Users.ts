import { GraphQLFloat, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { UserType } from "../TypeDefs/Users";
import { Users } from "../../Entities/Users";
import { Employees } from "../../Entities/Employees";
import { Freelancers } from "../../Entities/Freelancers";
import { Clients } from "../../Entities/Clients";
import { getRepository } from "typeorm";

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
        console.log('Resolver function executing:', args);
        console.log("ajkdsnks");
        const requiredFields = ['email', 'password', 'role', 'first_name', 'last_name'];
        const missingFields = requiredFields.filter(field => !(field in args));
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            throw new Error('Missing required fields. Please provide all required information.');
        }


        const { email, password, phone_number, role, first_name, middle_name, last_name, usertag, status, avatar } = args;
        try {
            const user = await Users.create({ email, password, phone_number, role, first_name, middle_name, last_name, usertag, status, avatar }).save();

            if (role.toUpperCase() === 'EMPLOYEE') {
                const { position, managerID, department } = args;
                const employee = await Employees.create({
                    userID: user.id,
                    department,
                    position,
                    managerID,
                    salary: 0, // Default salary, adjust as needed
                }).save();
                user.employee = employee;
            } else if (role.toUpperCase() === 'FREELANCER') {
                const { skills, portfolio_Link, availabilityStatus, hourly_Rate } = args;
                const freelancer = await Freelancers.create({
                    userID: user.id,
                    skills,
                    portfolio_Link,
                    availabilityStatus,
                    hourly_Rate,
                }).save();
                user.freelancer = freelancer;
            }
            else if (role.toUpperCase() === 'CLIENT') {
                const { companyName, address, phone } = args;
                const client = await Clients.create({
                    userID: user.id,
                    companyName,
                    address,
                }).save();
                user.client = client;
            }

            return user;
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

        // Check if required fields are present
        const requiredFields = ['email', 'password'];
        const missingFields = requiredFields.filter(field => !(field in args));
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            throw new Error('Missing required fields. Please provide all required information.');
        }

        try {
            const user = await getRepository(Users).findOne({ where: { email } });

            if (!user) {
                throw new Error("User not found");
            }

            // Check if the password is correct (you should use proper hashing and comparison in a real application)
            if (password !== user.password) {
                throw new Error("Incorrect password");
            }

            return user;
        } catch (error: any) {
            console.error("Failed to sign in:", error);
            throw new Error(error.message);
        }
    },
};