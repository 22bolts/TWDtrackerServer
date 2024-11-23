// src/routes/serviceRoutes.ts
import { Router, Request, Response } from 'express';
import { Services } from '../Entities/Services';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const service = Services.create(req.body);
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: "Unable to create service", error });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const services = await Services.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: "Unable to get services", error });
    }
});

router.get('/:id', async (req: any, res: Response) => {
    try {
        const service = await Services.findOne(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: "Unable to get service", error });
    }
});

router.put('/:id', async (req: any, res: Response) => {
    try {
        await Services.update(req.params.id, req.body);
        const service = await Services.findOne(req.params.id);
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: "Unable to update service", error });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await Services.delete(req.params.id);
        res.json({ message: "Service deleted" });
    } catch (error) {
        res.status(500).json({ message: "Unable to delete service", error });
    }
});

export { router as serviceRouter };
