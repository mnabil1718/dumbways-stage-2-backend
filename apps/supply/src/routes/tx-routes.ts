import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateTransactionSchema } from "../models/transaction-model";
import { postTransaction } from "../controllers/transactions-controller";

const router = Router();
router.post("/transfer-points", validate(CreateTransactionSchema), postTransaction);
export default router;
