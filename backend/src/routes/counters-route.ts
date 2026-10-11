import express, { Request, Response } from "express";
import {getNextCustomer} from "../controllers/tickets-controller";
import {NextCustomerResponseDTO} from "../models/dto/ticket-dto";
import {BadRequestError} from "../models/errors/badrequest-error";

const router = express.Router();

router.post(
    "/:counterId/next-customer",
    (
        req: Request<{ counterId: string }>,
        res: Response<NextCustomerResponseDTO>
    ) => {
        const counterId = Number(req.params.counterId);
        if (!Number.isSafeInteger(counterId) || counterId <= 0) {
            throw new BadRequestError("Invalid counter ID");
        }
        const ticket = getNextCustomer(counterId);
        if (ticket === null) {
            return res.status(204).send();
        }
        return res.json(ticket);
    }
);

export default router;