import { GraphQLID, GraphQLNonNull, GraphQLFloat, GraphQLString } from "graphql";
import { TransactionType } from "../TypeDefs/TransactionType";
import { Transactions } from "../../Entities/Transactions";
import { Orders } from "../../Entities/Orders";
import { ApolloError } from "apollo-server-express";
import { Users } from "../../Entities/Users";

export const CREATE_TRANSACTION = {
    type: TransactionType,
    args: {
        userID: { type: new GraphQLNonNull(GraphQLID) }, // Added userID field
        orderID: { type: new GraphQLNonNull(GraphQLID) },
        amount: { type: new GraphQLNonNull(GraphQLFloat) },
        paymentMethod: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(parent: any, args: any) {
        try {
            const { userID, orderID, amount, paymentMethod } = args;

            // Fetch the order with the given orderID
            const order = await Orders.findOne({ where: { id: orderID } });
            if (!order) {
                throw new ApolloError("Order not found", "ORDER_NOT_FOUND");
            }

            // Fetch the order with the given orderID
            const user = await Users.findOne({ where: { id: userID } });
            if (!user) {
                throw new ApolloError("User not found", "USER_NOT_FOUND");
            }

            // Create the transaction with the userID included
            const transaction = await Transactions.create({
                userID,
                orderID,
                transactionDate: new Date(),
                amount,
                paymentMethod,
                status: 'completed', // Assuming the transaction is completed immediately
            }).save();

            // Update the order balance
            order.balance -= amount;
            await Orders.save(order);

            return transaction;
        } catch (error) {
            console.error("Failed to create transaction:", error);
            throw new ApolloError("Unable to create transaction at this time. Please try again later.", "INTERNAL_SERVER_ERROR");
        }
    },
};
