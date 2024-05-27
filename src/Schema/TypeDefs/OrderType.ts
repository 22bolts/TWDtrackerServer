import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLFloat, GraphQLList } from "graphql";
import { TransactionType } from "./TransactionType"; // Assuming you have a TransactionType defined

export const OrderType = new GraphQLObjectType({
    name: "Order",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        userID: { type: new GraphQLNonNull(GraphQLID) },
        serviceID: { type: new GraphQLNonNull(GraphQLID) },
        orderDate: { type: new GraphQLNonNull(GraphQLString) },
        status: { type: new GraphQLNonNull(GraphQLString) },
        totalPrice: { type: new GraphQLNonNull(GraphQLFloat) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
        level: { type: GraphQLString },
        orderType: { type: new GraphQLNonNull(GraphQLString) },
        employeeID: { type: GraphQLID },
        freelancerID: { type: GraphQLID },
        completionDate: { type: GraphQLString }, // Add completion date field
        transactions: { type: new GraphQLList(TransactionType) } // Assuming you want to include transactions in the OrderType
    }),
});
