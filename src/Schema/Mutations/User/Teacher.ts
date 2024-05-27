import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from "graphql";
import { Users } from "../../../Entities/User/Users";
import { TeacherType } from "../../TypeDefs/User/Teachers";

export const CREATE_TEACHER = {
    type: TeacherType,
    args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }, // Consider handling the hash server-side
        role: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        middleName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(parent: any, args: any) {
        // Logic to create a new user
        try {
            await Users.insert(args);
            return args
            }catch (error) {
                console.error("Failed to add user:", error);
    
                throw new Error("Unable to Add user this time please try again later");
            }
    },
};
