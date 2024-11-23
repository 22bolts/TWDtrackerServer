// // src/routes/paymentRoutes.ts
// import { Router, Request, Response } from 'express';
// import { Transactions } from '../Entities/Transactions';

// const router = Router();

// router.post('/', async (req: Request, res: Response) => {
//     try {
//         const transaction = Transactions.create(req.body);
//         await transaction.save();
//         res.json(transaction);
//     } catch (error) {
//         res.status(500).json({ message: "Unable to create transaction", error });
//     }
// });

// router.get('/', async (req: Request, res: Response) => {
//     try {
//         const transactions = await Transactions.find();
//         res.json(transactions);
//     } catch (error) {
//         res.status(500).json({ message: "Unable to get transactions", error });
//     }
// });

// router.get('/:id', async (req: any, res: Response) => {
//     try {
//         const transaction = await Transactions.findOne(req.params.id);
//         if (!transaction) {
//             return res.status(404).json({ message: "Transaction not found" });
//         }
//         res.json(transaction);
//     } catch (error) {
//         res.status(500).json({ message: "Unable to get transaction", error });
//     }
// });

// export { router as paymentRouter };


// src/routes/paymentRoutes.ts
import { Router } from 'express';
import { stripePaymentHandler } from '../controllers/paymentController';

const router = Router();

router.post('/pay', stripePaymentHandler);

export { router as paymentRouter};
