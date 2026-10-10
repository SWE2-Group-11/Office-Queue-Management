import express, { Request, Response } from "express";
import { createTicket, getNextCustomer } from "../controllers/tickets-controller";
import { CreateTicketRequestDTO, CreateTicketRequestSchema, CreateTicketResponseDTO, NextCustomerResponseDTO } from "../models/dto/ticket-dto";
import { validateBody } from "../services/middleware-service";

const router = express.Router();


router.post(
    "/",
    validateBody(CreateTicketRequestSchema),
    (req: Request<{}, CreateTicketResponseDTO, CreateTicketRequestDTO>, res: Response<CreateTicketResponseDTO>) => {
        res.json(createTicket(req.body));
    },
);

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
