import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLList } from "graphql";
import { DepartmentType } from "./Departments"; // Assuming you have this defined similarly
import { TeacherType } from "./Teachers"; // Define this based on the structure
import { StudentType } from "./Students"; // Define this based on the structure
import { Lecturers } from "../../../Entities/User/Lecturers";

export const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        middleName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        // Assuming a User might be a Teacher or Student, you might have optional links
        teacher: { 
            type: TeacherType,
            resolve(parent, args) {
                // Resolver to fetch Teacher details if this User is a Teacher
            }
        },
        student: { 
            type: StudentType,
            resolve(parent, args) {
                // Resolver to fetch Student details if this User is a Student
            }
        },
    }),
});
