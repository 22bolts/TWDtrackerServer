import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLList } from "graphql";
import { CBTQuestionType } from "./CBTQuestions"; // You'll define this similarly

export const CBTType = new GraphQLObjectType({
    name: "CBT",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        startDate: { type: new GraphQLNonNull(GraphQLString) },
        endDate: { type: new GraphQLNonNull(GraphQLString) },
        duration: { type: new GraphQLNonNull(GraphQLInt) },
        questions: { 
            type: new GraphQLList(CBTQuestionType),
            resolve(parent, args) {
                // Resolver logic to fetch CBT questions based on the CBT ID
            }
        },
    }),
});
