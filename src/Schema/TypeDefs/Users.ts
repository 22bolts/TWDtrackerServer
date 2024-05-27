import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLList } from "graphql";
import { EmployeeType } from "./Employee";
import { FreelancerType } from "./Freelancer";
import { ClientType } from "./ClientType";

export const UserType: GraphQLObjectType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        phone_number: { type: GraphQLString },
        first_name: { type: new GraphQLNonNull(GraphQLString) },
        middle_name: { type: new GraphQLNonNull(GraphQLString) },
        last_name: { type: new GraphQLNonNull(GraphQLString) },
        usertag: { type: new GraphQLNonNull(GraphQLString) },
        status: { type: new GraphQLNonNull(GraphQLString) },
        avatar: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: new GraphQLNonNull(GraphQLString) },
        employee: { 
            type: EmployeeType,
            resolve(parent, args) {
                // Resolver to fetch Employee details if this User is an Employee
            }
        },
        freelancer: { 
            type: FreelancerType,
            resolve(parent, args) {
                // Resolver to fetch Freelancer details if this User is a Freelancer
            }
        },
        client: { 
            type: ClientType,
            resolve(parent, args) {
                // Resolver to fetch Client details if this User is a Client
            }
        },
    }),
});
