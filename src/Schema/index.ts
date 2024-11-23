import { GraphQLObjectType, GraphQLSchema } from "graphql";
// import { CREATE_USER, SIGN_IN } from "./Mutations/Users";
// import { GET_ALL_USERS, GET_USER_BY_ID } from "./Queries/User";
// import { CREATE_TRANSACTION } from "./Mutations/Transactions";

const RootQuery = new GraphQLObjectType({
    name: "query",
    fields: {
        // getAllUsers: GET_ALL_USERS,
        // getUserById: GET_USER_BY_ID,

        // signIn: SIGN_IN,
    }
})

const Mutation = new GraphQLObjectType({
    name: "mutation",
    fields: {
        // createUser: CREATE_USER,
        // updatePassword: UPDATE_PASSWORD,
        // deleteUser: DELETE_USER,

        // createOrder: CREATE_ORDER,
        // updateBalance: UPDATE_BALANCE,


        // createTransaction: CREATE_TRANSACTION,

        
        //Courses
        // createCourse: CREATE_COURSE,
        // addLecturer: ADD_LECTURER,
    }
})


export const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})