import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateTransactionSchema } from "../models/transaction-model";
import { postTransaction } from "../controllers/transactions-controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();
router.post("/transfer-points", validate(CreateTransactionSchema), authenticate, postTransaction);
export default router;
