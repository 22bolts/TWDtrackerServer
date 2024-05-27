import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLList } from "graphql";
import { DepartmentType } from "../User/Departments"; // Define this similarly
import { TeacherType } from "../User/Teachers"; // Ensure this is defined
import { CBTType } from "./CBT"; // You will need to define this

export const CourseType = new GraphQLObjectType({
    name: "Course",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        code: { type: new GraphQLNonNull(GraphQLInt) },
        creditLoad: { type: new GraphQLNonNull(GraphQLInt) },
        department: { 
            type: DepartmentType,
            resolve(parent, args) {
                // Resolver to fetch Department details
            }
        },
        lecturer: { 
            type: TeacherType,
            resolve(parent, args) {
                // Resolver to fetch Teacher details
            }
        },
        cbts: { 
            type: new GraphQLList(CBTType),
            resolve(parent, args) {
                // Resolver to fetch CBT details
            }
        },
    }),
});
