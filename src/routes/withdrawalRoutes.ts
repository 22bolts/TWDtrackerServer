// src/routes/withdrawalRoutes.ts
import { Router } from 'express';
// import { withdrawFunds, setAutoWithdrawal } from '../controllers/withdrawalController';
import { withdrawFunds, setAutoWithdrawal } from '../controllers/withdrawalController';

const router = Router();

router.post('/withdraw', withdrawFunds);
router.post('/set-auto-withdrawal', setAutoWithdrawal);

export { router as withdrawalRouter };
