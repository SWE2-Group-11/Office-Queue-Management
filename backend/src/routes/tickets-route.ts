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

export default router;
