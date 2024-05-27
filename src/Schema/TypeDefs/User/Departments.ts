import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull } from "graphql";

export const DepartmentType = new GraphQLObjectType({
    name: "Department",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        faculty: { type: new GraphQLNonNull(GraphQLString) },
    }),
});
