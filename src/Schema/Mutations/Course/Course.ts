import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLInt, GraphQLID } from "graphql";
import { getRepository } from "typeorm";
import { Users } from "../../../Entities/User/Users";
import { CourseType } from "../../TypeDefs/Course/Courses";
import { Courses } from "../../../Entities/Course/Courses";
import { Lecturers } from "../../../Entities/User/Lecturers";

export const CREATE_COURSE = {
    type: CourseType,
    args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        code: { type: new GraphQLNonNull(GraphQLString) },
        creditLoad: { type: new GraphQLNonNull(GraphQLInt) },
    },
    async resolve(parent: any, args: any) {
        // Logic to create a new user
        try {
            await Courses.insert(args);
            return args
            }catch (error) {
                console.error("Failed to add user:", error);
    
                throw new Error("Unable to Add user this time please try again later");
            }
    },
};

export const ADD_LECTURER = {
    type: CourseType, // Assuming this returns the updated course
    args: {
        courseId: { type: new GraphQLNonNull(GraphQLID) },
        lecturerId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(parent: any, args: any) {
        const { courseId, lecturerId } = args;

        try {
            const courseRepository = getRepository(Courses);
            const lecturerRepository = getRepository(Lecturers);

            // Find the course and lecturer by ID
            const course = await courseRepository.findOne({where: {id: courseId}, relations: ["lecturers"]});
            const lecturer = await lecturerRepository.findOne({where: {id: lecturerId}});

            if (!course) {
                throw new Error("Course not found");
            }

            if (!lecturer) {
                throw new Error("Lecturer not found");
            }

            // Add the lecturer to the course's lecturers collection
            course.lecturers = [...course.lecturers, lecturer];
            await courseRepository.save(course);

            return course;
        } catch (error) {
            console.error("Failed to add lecturer to course:", error);
            throw new Error("Unable to add lecturer to course at this time, please try again later.");
        }
    },
};
