import { Router, Request, Response } from 'express';
import { Projects } from '../Entities/Projects';
import { Users } from '../Entities/Users';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { Applications } from '../Entities/Applications';
import { Portfolios } from '../Entities/Portfolios';
import { getRepository } from 'typeorm';

const router = Router();

// Protect all routes with JWT middleware
// router.use(authenticateJWT);

// Create a new project
router.post('/', async (req: Request, res: Response) => {
    try {
        const { developerId, clientId, ...projectData } = req.body;

        const developer = developerId ? await Users.findOne({ where: { id: developerId } }) : null;
        const client = clientId ? await Users.findOne({ where: { id: clientId } }) : null;

        const project = Projects.create({
            ...projectData,
            developer: developer,
            client: client
        });
        
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Unable to create project", error });
        console.log(error);
    }
});

// Get all projects
router.get('/', async (req: Request, res: Response) => {
    try {
        const projects = await Projects.find({ relations: ["developer", "client"] });
        
        res.json(projects);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Unable to get projects", error });
    }
});

// Get all projects for a specific user
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const projectsRepository = getRepository(Projects);

        const projects = await projectsRepository.find({
            relations: ["developer", "client", "applications"]
        });

        console.log("all project is:", projects)

        res.json(projects);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Unable to get projects", error });
    }
});

// Get a specific project by ID
router.get('/projectDetails/:id', async (req: any, res: Response) => {
    console.log("trying    fkdjshkf dsfjshashfshajd hdsjhfkajhfjdhsajhjsn");
    try {
        const project = await Projects.findOne({ where : {id :req.params.id}, relations: ["developer", "client", "applications.user", "applications.portfolios"] });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        console.log("the project is:", project)
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Unable to get project", error });
    }
});

// Update a project by ID
router.put('/:id', async (req: any, res: Response) => {
    try {
        const { developerId, clientId, ...projectData } = req.body;

        const developer = await Users.findOne(developerId);
        const client = await Users.findOne(clientId);

        if (!developer || !client) {
            return res.status(404).json({ message: "Developer or Client not found" });
        }

        await Projects.update(req.params.id, { ...projectData, developer, client });
        const project = await Projects.findOne({ where : {id :req.params.id}, relations: ["developer", "client"] });
        res.json(project);
    } catch (error) {
        res.status (500).json({ message: "Unable to update project", error });
    }
});

//Delete a project by ID
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await Projects.delete(req.params.id);
    } catch (error) {
        res.status (500).json({ message: "Unable to Delete project", error });
    }
});

// Apply for a project
router.post('/:projectId/apply', async (req: Request, res: Response) => {
    console.log("Applying for job");

    try {
        const { projectId } = req.params;
        const { userId, message, portfolioIds } = req.body;

        // Validate projectId and userId
        const projectIdNumber = Number(projectId);
        const userIdNumber = Number(userId);

        if (isNaN(projectIdNumber) || isNaN(userIdNumber)) {
            console.log(`The IDs aren't numbers. The project ID is ${projectIdNumber} and the user ID is ${userIdNumber}`);
            return res.status(400).json({ message: "Invalid projectId or userId" });
        }else{
            console.log("IDs are number");
        }

        // Log received data
        console.log("Received data:", { projectId, userId, message, portfolioIds });

        const userRepository = getRepository(Users);
        const projectRepository = getRepository(Projects);
        const applicationsRepository = getRepository(Applications);
        const portfoliosRepository = getRepository(Portfolios);

        
        console.log("Shit");
        const user = await userRepository.findOne({ where: { id: userIdNumber }, relations: ['applications'] });
        const project = await projectRepository.findOne({ where: { id: projectIdNumber }, relations: ["client", 'applications', 'applications.user'] });
        const portfolios = await portfoliosRepository.findByIds(portfolioIds);

        if (!user || !project) {
            return res.status(404).json({ message: "User or Project not found" });
        }

        console.log("Shit 2",);
        // try{
        //     if (project.applications.some(application => application.user.id === user.id)) {
        //         return res.status(400).json({ message: "User has already applied for this project" });
        //     }
        // } catch(error){
        //     console.log("Error Verifying if user has applied", error);
        // }
        console.log("Shit 3");

        console.log("Shit 4");
        const application = applicationsRepository.create({
            user: user,
            project: project,
            message: message,
            portfolios: portfolios,
        });

        console.log("Shit 5");

        await applicationsRepository.save(application);

        // console.log({ message: "Application successful", application });

    } catch (error) {
        console.error("Error applying for job", error);
        res.status(500).json({ message: "Unable to apply for project", error });
    }
});


// Get all applications for a project
// router.get('/:projectId/applications', authenticateJWT, async (req: Request, res: Response) => {
//     try {
//         const { projectId } = req.params;
//         const applications = await Applications.find({ where: { project: { id: Number(projectId) } }, relations: ['user', 'portfolios'] });

//         res.json(applications);
//     } catch (error) {
//         res.status(500).json({ message: "Unable to get applications", error });
//     }
// });

// Get all applications for a project
// router.get('/:projectId/applications', async (req: Request, res: Response) => {
//     try {
//         const { projectId } = req.params;
//         // const applications = await Applications.find({ where: { project: { id: Number(projectId) } }, relations: ['user', 'portfolios'] });
//         const applications = await Applications.find({ where: { project: { id: Number(projectId) } }, relations: ['user', 'portfolios'] });

//         console.log("Applications are:", applications);

//         res.json(applications);
//     } catch (error) {
//         res.status(500).json({ message: "Unable to get applications", error });
//     }
// });

// Get all applications for a project
router.get('/:projectId/applications', async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const applicationsRepository = getRepository(Applications);
        const applications = await applicationsRepository.find({ where: { project: { id: Number(projectId) } }, relations: ['user', 'portfolios'] });

        console.log("Applications are:", applications);

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: "Unable to get applications", error });
    }
});

// Get a specific application by ID
// router.get('/:projectId/applications/:applicationId', authenticateJWT, async (req: Request, res: Response) => {
//     try {
//         const { applicationId } = req.params;
//         const application = await Applications.findOne({ where: { id: Number(applicationId) }, relations: ['user', 'portfolios'] });

//         if (!application) {
//             return res.status(404).json({ message: "Application not found" });
//         }

//         res.json(application);
//     } catch (error) {
//         res.status(500).json({ message: "Unable to get application", error });
//     }
// });

// Get a specific application by ID
router.get('/:projectId/applications/:applicationId', async (req: Request, res: Response) => {
    try {
        const { applicationId } = req.params;
        const applicationsRepository = getRepository(Applications);
        const application = await applicationsRepository.findOne({ where: { id: Number(applicationId) }, relations: ['user', 'portfolios'] });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: "Unable to get application", error });
    }
});

// Accept an application for a project
router.put('/:projectId/applications/:applicationId/accept', async (req: Request, res: Response) => {
    try {
        const { projectId, applicationId } = req.params;
        const applicationsRepository = getRepository(Applications);
        const projectsRepository = getRepository(Projects);

        // Find the application by ID
        const application = await applicationsRepository.findOne({ where: { id: Number(applicationId), project: { id: Number(projectId) } }, relations: ['project', 'user'] });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Update the application status to 'accepted'
        application.status = 'accepted';
        await applicationsRepository.save(application);

        // Optionally update the project details
        // For example, you might want to set the developer of the project to the user who was accepted
        const project = await projectsRepository.findOne({ where: { id: Number(projectId) } });
        if (project) {
            await projectsRepository.save(project);
        }

        res.json({ message: "Application accepted", application });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Unable to accept application", error });
    }
});

export { router as projectRouter };
