import {Router} from 'express';
import { TicketsController } from '../controllers/tickets-controller';
import { TicketDAO } from '../dao/ticket-dao';
import { ServiceDAO } from '../dao/service-dao';
import {AppError} from '../models/errors/app-error';
import {sendAppError} from '../services/error-service';
import {db} from '../database/database.js';

export const ticketsRouter = Router();

const controller = new TicketsController(new TicketDAO(db), new ServiceDAO(db));

ticketsRouter.post('/counters/:counterId/next-customer', async (req, res) => {
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