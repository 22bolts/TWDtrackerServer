import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLInt } from "graphql";
import { UserType } from "../../TypeDefs/User/Users";
import { Users } from "../../../Entities/User/Users";
import { Students } from "../../../Entities/User/Students";
import { getRepository } from "typeorm";
import { Lecturers } from "../../../Entities/User/Lecturers";
import { Departments } from "../../../Entities/User/Departments";

function generateStudentID(departmentCode: any) {
    const year = new Date().getFullYear().toString();
    const randomSequence = Math.floor(10000 + Math.random() * 90000).toString();
    return `${year}0301${randomSequence}`;
}

function generateLecturerID(departmentCode: string): string {
    const year = new Date().getFullYear().toString().slice(-2); // Get the last two digits of the year
    const randomSequence = Math.floor(1000 + Math.random() * 9000).toString(); // Generates a random 4-digit number
    return `L${departmentCode.toUpperCase().slice(0, 3)}${year}${randomSequence}`;
}

export const CREATE_USER = {
    type: UserType,
    args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }, // Consider hashing passwords
        role: { type: new GraphQLNonNull(GraphQLString) },
        first_name: { type: new GraphQLNonNull(GraphQLString) },
        middleName: { type: GraphQLString },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        departmentCode: { type: new GraphQLNonNull(GraphQLString) }, // Assuming department code is required
    },
    async resolve(parent: any, args: any) {
        const { email, password, role, firstName, middleName, lastName, departmentCode } = args;
        const queryRunner = getRepository(Users).manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = queryRunner.manager.create(Users, { email, password, role, firstName, middleName, lastName });
            await queryRunner.manager.save(user);

            if (role === 'lecturer') {
                // Fetch the department entity based on departmentCode
                const department = await queryRunner.manager.findOne(Departments, { where: { code: departmentCode } });
                if (!department) {
                    throw new Error("Department not found");
                }

                const lecturerId = generateLecturerID(departmentCode); // Assuming this generates a suitable ID
                // Create the Lecturer with the associated department
                const lecturer = queryRunner.manager.create(Lecturers, { 
                    id: lecturerId,
                    user, 
                    department // Associate the fetched department entity here
                });
                await queryRunner.manager.save(lecturer);
            } else if (role === 'student') {
                // Similar logic for students, if necessary
                const department = await queryRunner.manager.findOne(Departments, { where: { code: departmentCode } });
                if (!department) {
                    throw new Error("Department not found");
                }

                const enrollmentYear = new Date().getFullYear();
                const regNumber = generateStudentID(departmentCode); // Assuming this generates a suitable ID
                // Create the Lecturer with the associated department
                const student = queryRunner.manager.create(Students, { 
                    regNumber: regNumber, 
                    user,
                    majorDepartment: department,
                    enrollmentYear,
                });
                await queryRunner.manager.save(student);
            }
            // else{
            //     throw new Error("Users role must be assigned to either 'Lecturer' or 'Student'.");
            // }

            await queryRunner.commitTransaction();
            return { ...args, password: undefined }; // Exclude password from the result
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("Failed to add user:", error);
            throw new Error("Unable to add user this time, please try again later.");
        } finally {
            await queryRunner.release();
        }
    },
};
