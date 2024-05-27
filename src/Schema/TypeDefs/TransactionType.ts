import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLFloat } from "graphql";

export const TransactionType = new GraphQLObjectType({
    name: "Transaction",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        orderID: { type: new GraphQLNonNull(GraphQLID) },
        userID: { type: new GraphQLNonNull(GraphQLID) },
        transactionDate: { type: new GraphQLNonNull(GraphQLString) },
        amount: { type: new GraphQLNonNull(GraphQLFloat) },
        paymentMethod: { type: new GraphQLNonNull(GraphQLString) },
        status: { type: new GraphQLNonNull(GraphQLString) }
    }),
});
