import type { Request, Response } from 'express';
import { TicketDAO } from '../dao/ticket-dao';
import { ServiceDAO } from '../dao/service-dao';
import { Ticket } from '../models/entities/ticket';
import { TicketDTO } from '../models/dto/ticket-dto';
import { NotFoundError } from '../models/errors/notfound-error';
import { BadRequestError } from '../models/errors/badrequest-error';

export class TicketsController {
    private ticketDAO: TicketDAO;
    private serviceDAO: ServiceDAO;

    constructor(ticketDAO: TicketDAO, serviceDAO: ServiceDAO) {
        this.ticketDAO = ticketDAO;
        this.serviceDAO = serviceDAO;
    }

    /**
     * Business logic method to create a new ticket.
     * Uses try/catch to intercept and rethrow errors to the caller.
     *
     * @param service_id The numerical ID of the service type.
     * @returns A Promise resolving to a TicketDTO containing the generated ID.
     */
    public createTicket = async (service_id: number): Promise<TicketDTO> => {
        try {
            // Validation check (Throws 400)
            if (service_id === undefined || service_id === null) {
                throw new BadRequestError("The field 'service_id' is required.");
            }

            // Existence check (Throws 404)
            const service = this.serviceDAO.findServiceById(Number(service_id));
            if (!service) {
                throw new NotFoundError("Service not found");
            }

            // Logic execution (Create Ticket)
            const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            const newTicket: Ticket = {
                day_date: currentDate,
                service_id: service.id,
                counter_id: null
            };

            // Synchronously save via better-sqlite3
            const insertedId = this.ticketDAO.saveTicket(newTicket);

            // Return the structured DTO
            return new TicketDTO(insertedId);

        } catch (error) {
            throw error;
        }
    };
    
    /**
     * Retrieves the next customer for the given counter ID.
     * @param counterId 
     * @returns A Promise resolving to a TicketDTO or null if no customer is found.
     */
    public getNextCustomer = async (counterId: number): Promise<TicketDTO | null> => {
        if(!Number.isSafeInteger(counterId) || counterId <= 0) {
            throw new BadRequestError("Invalid counter ID");
        }
        return this.ticketDAO.inTransaction(() => {
            // Check if the counter exists
            if (!this.ticketDAO.counterExists(counterId)) {
                throw new NotFoundError("Counter not found");
            }
            const now = new Date();
            const day = [now.getFullYear(),
                         (now.getMonth() + 1).toString().padStart(2, '0'),
                         now.getDate().toString().padStart(2, '0')].join('-');

            const queues = this.serviceDAO.getWaitingQueues(counterId, day);
            queues.sort((a, b) => a.queueLength - b.queueLength || a.serviceTime - b.serviceTime || a.service.id - b.service.id);

            const selectedService = queues.length > 0 ? queues[0].service : null;
            if(!selectedService) return null; 

            const ticket = this.ticketDAO.findFirstWaitingTicket(selectedService.id, day);
            if(!ticket) {
                throw new NotFoundError("Selected queue has no waiting tickets");
            }

            this.ticketDAO.assignTicketToCounter(ticket.id, counterId, day);
            return new TicketDTO(ticket.id);
    });  
    }
}
