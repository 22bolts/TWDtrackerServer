import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull } from "graphql";
import { DepartmentType } from "./Departments";

export const StudentType = new GraphQLObjectType({
    name: "Student",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        enrollmentYear: { type: new GraphQLNonNull(GraphQLString) },
        majorDepartment: { 
            type: DepartmentType,
            resolve(parent, args) {
                // Resolver logic to fetch Department details based on the student's major department ID
            }
        },
    }),
});
