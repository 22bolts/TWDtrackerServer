import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLFloat } from "graphql";
import { UserType } from "./Users";

export const EmployeeType = new GraphQLObjectType({
    name: "Employee",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        userID: { type: new GraphQLNonNull(GraphQLID) },
        department: { type: new GraphQLNonNull(GraphQLString) },
        position: { type: new GraphQLNonNull(GraphQLString) },
        managerID: { type: GraphQLID },
        salary: { type: new GraphQLNonNull(GraphQLFloat) },
        user: {
            type: UserType,
            resolve(parent, args) {
                // Resolver to fetch User details for this Employee
            }
        }
    }),
});
