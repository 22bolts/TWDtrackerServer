import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLNonNull } from "graphql";

export const CBTQuestionType = new GraphQLObjectType({
    name: "CBTQuestion",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        questionText: { type: new GraphQLNonNull(GraphQLString) },
        correctAnswer: { type: new GraphQLNonNull(GraphQLString) },
        marks: { type: new GraphQLNonNull(GraphQLInt) },
    }),
});
