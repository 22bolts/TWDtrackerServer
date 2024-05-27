import { ApolloError } from "apollo-server-express";
import { GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { OrderType } from "../TypeDefs/OrderType";
import { Orders } from "../../Entities/Orders";

export const CREATE_ORDER = {
    type: OrderType,
    args: {
        userID: { type: new GraphQLNonNull(GraphQLID) },
        serviceID: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: new GraphQLNonNull(GraphQLString) },
        totalPrice: { type: new GraphQLNonNull(GraphQLFloat) },
        level: { type: GraphQLString },
        orderType: { type: new GraphQLNonNull(GraphQLString) },
        employeeID: { type: GraphQLID },
        freelancerID: { type: GraphQLID },
        completionDate: { type: GraphQLString },
    },
    async resolve(parent: any, args: any) {
        try {
            const { userID, serviceID, status, totalPrice, level, orderType, employeeID, freelancerID, completionDate } = args;

            // Generate current UTC date and time
            const orderDate = new Date().toISOString();
            const balance = totalPrice;

            const order = await Orders.create({
                userID,
                serviceID,
                orderDate,
                status,
                totalPrice,
                balance,
                level,
                orderType,
                employeeID,
                freelancerID,
                completionDate
            }).save();

            return order;
        } catch (error) {
            console.error("Failed to create order:", error);
            throw new ApolloError("Unable to create order at this time. Please try again later.", "INTERNAL_SERVER_ERROR"); 
        }
    },
};


export const UPDATE_BALANCE = {
    type: OrderType,
    args: {
        orderID: { type: new GraphQLNonNull(GraphQLID) },
        newBalance: { type: new GraphQLNonNull(GraphQLFloat) },
    },
    async resolve(parent: any, args: any) {
        try {
            const { orderID, newBalance } = args;

            // Fetch the order
            const order = await Orders.findOne(orderID);
            if (!order) {
                throw new ApolloError("Order not found", "ORDER_NOT_FOUND");
            }

            // Update the balance
            order.balance = newBalance;
            await Orders.save(order);

            return order;
        } catch (error) {
            console.error("Failed to update balance:", error);
            throw new ApolloError("Unable to update balance at this time. Please try again later.", "INTERNAL_SERVER_ERROR");
        }
    },
};