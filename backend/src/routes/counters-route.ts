import express, { Request, Response } from "express";
import {getNextCustomer} from "../controllers/tickets-controller";
import {NextCustomerResponseDTO} from "../models/dto/ticket-dto";

const router = express.Router();

router.post(
    "/counters/:counterId/next-customer",
    (
        req: Request<{ counterId: string }>,
        res: Response<NextCustomerResponseDTO>
    ) => {
        const ticket = getNextCustomer(Number(req.params.counterId));
        if (ticket === null) {
            return res.status(204).send();
        }
        return res.json(ticket);
    }
);

export default router;