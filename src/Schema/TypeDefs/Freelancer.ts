import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLFloat, GraphQLList } from "graphql";
import { UserType } from "./Users";

export const FreelancerType = new GraphQLObjectType({
    name: "Freelancer",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        userID: { type: new GraphQLNonNull(GraphQLID) },
        skills: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
        portfolio_Link: { type: new GraphQLNonNull(GraphQLString) },
        availabilityStatus: { type: new GraphQLNonNull(GraphQLString) },
        hourly_Rate: { type: new GraphQLNonNull(GraphQLFloat) },
        user: {
            type: UserType,
            resolve(parent, args) {
                // Resolver to fetch User details for this Freelancer
            }
        }
    }),
});
