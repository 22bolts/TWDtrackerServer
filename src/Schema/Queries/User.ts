import { GraphQLObjectType, GraphQLList, GraphQLID } from "graphql";
import { UserType } from "../TypeDefs/Users";
import { Users } from "../../Entities/Users";

export const GET_ALL_USERS = {
    type: new GraphQLList(UserType),
    async resolve(parent: any, args: any) {
        try {
            // Attempt to fetch all users from the database
            console.log("trying");
            const users = await Users.find();
            console.log(users);
            return users;
        } catch (error) {
            // Log the error to the console or a logging service
            console.error("Failed to fetch users:", error);

            throw new Error("Unable to fetch users at this time. Please try again later.");
        }
    },
    user: {
    },
    users: {
    },
};

export const GET_USER_BY_ID = {
    type: UserType,
    args: {
        id: { type: GraphQLID }
    },
    async resolve(parent: any, args: any) {
        const {id} = args;
        const user = await Users.findOne({where: {id: id}});

        if(!user){
            throw new Error("Username doesn't exist");
        }

        console.log(user);

        return user;
    },
}
