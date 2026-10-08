import {Router} from 'express';
import {getNextCustomer} from '../controllers/tickets-controller.js';

export const ticketsRouter = Router();

ticketsRouter.post('/counters/:counterId/next-customer', getNextCustomer);