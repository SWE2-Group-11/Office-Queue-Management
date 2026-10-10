import express, { Request, Response } from "express";
import { createTicket,  } from "../controllers/tickets-controller";
import { CreateTicketRequestDTO, CreateTicketRequestSchema, CreateTicketResponseDTO } from "../models/dto/ticket-dto";
import { validateBody } from "../services/middleware-service";

const router = express.Router();

router.post(
    "/",
    validateBody(CreateTicketRequestSchema),
    (req: Request<{}, CreateTicketResponseDTO, CreateTicketRequestDTO>, res: Response<CreateTicketResponseDTO>) => {
        res.json(createTicket(req.body));
    },
);

/** 
router.post('/counters/:counterId/next-customer', async (req, res) => {
    try {
        const counterId = Number(req.params.counterId);
        const ticket = await controller.getNextCustomer(counterId);

        // If no ticket is found, respond with '204 No Content' because it could mean that there are no customers waiting for that counter.
        if (ticket === null) {
            res.status(204).send(); // No Content
        }
        
        return res.status(200).json(ticket);
    } catch (error) {
        if(error instanceof AppError) {
            return sendAppError(error, res);
        }
        return sendAppError(new AppError(500, "InternalServerError", "An unexpected error occurred."), res);
    }
});
*/