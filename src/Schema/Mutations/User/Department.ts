import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from "graphql";
import { getRepository } from "typeorm";
import { DepartmentType } from "../../TypeDefs/User/Departments";
import { Departments } from "../../../Entities/User/Departments";

export const CREATE_DEPARTMENT = {
    type: DepartmentType,
    args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        faculty: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(parent: any, args: any) {
        const { name, faculty } = args;
        const departmentRepository = getRepository(Departments);

        try {
            const departmentRepository = getRepository(Departments);
            const customID = generateDepartmentID(args.name, args.faculty); // Adjust based on your ID generation logic
        
            const newDepartment = departmentRepository.create({
                code: customID,
                name: args.name,
                faculty: args.faculty,
            });
        
            await departmentRepository.save(newDepartment);
        
            return newDepartment; // Adjust according to what you wish to return
        } catch (error: any) {
            console.error("Failed to add department:", error.message);
            throw new Error(`Unable to add department this time, please try again later. Details: ${error.message}`);
        }
    },
};


function generateDepartmentID(name: string, faculty: string): string {
    const nameInitial = name.charAt(0).toUpperCase();
    const facultyInitials = faculty.substring(0, 3).toUpperCase();
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates a random number between 1000 and 9999

    return `${nameInitial}${facultyInitials}${randomNumber}`;
}
