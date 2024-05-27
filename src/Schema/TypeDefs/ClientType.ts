import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull } from "graphql";
import { UserType } from "./Users";

export const ClientType = new GraphQLObjectType({
    name: "Client",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        userID: { type: new GraphQLNonNull(GraphQLID) },
        companyName: { type: new GraphQLNonNull(GraphQLString) },
        address: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: new GraphQLNonNull(GraphQLString) },
        user: {
            type: UserType,
            resolve(parent, args) {
                // Resolver to fetch User details for this Client
            }
        }
    }),
});
