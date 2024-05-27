import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLFloat } from "graphql";

export const ServiceType = new GraphQLObjectType({
    name: "Service",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        type: { type: new GraphQLNonNull(GraphQLString) },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        royaltyLevels: { type: GraphQLString }
    }),
});
