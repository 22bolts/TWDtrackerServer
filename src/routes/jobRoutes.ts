// src/routes/jobRoutes.ts
import { Router, Request, Response } from 'express';
import { Orders } from '../Entities/Orders';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Protect all routes with JWT middleware
router.use(authenticateJWT);

router.post('/', async (req: Request, res: Response) => {
    try {
        const order = Orders.create(req.body);
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Unable to create order", error });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const orders = await Orders.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Unable to get orders", error });
    }
});

router.get('/:id', async (req: any, res: Response) => {
    try {
        const order = await Orders.findOne(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Unable to get order", error });
    }
});

router.put('/:id', async (req: any, res: Response) => {
    try {
        await Orders.update(req.params.id, req.body);
        const order = await Orders.findOne(req.params.id);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Unable to update order", error });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await Orders.delete(req.params.id);
        res.json({ message: "Order deleted" });
    } catch (error) {
        res.status(500).json({ message: "Unable to delete order", error });
    }
});

export { router as jobRouter };
