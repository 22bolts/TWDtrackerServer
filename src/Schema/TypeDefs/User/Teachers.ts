import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull } from "graphql";
import { DepartmentType } from "./Departments";

export const TeacherType = new GraphQLObjectType({
    name: "Teacher",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        department: { 
            type: DepartmentType,
            resolve(parent, args) {
                // Resolver logic to fetch Department details based on the teacher's department ID
            }
        },
    }),
});
