import { saveTicket, counterExists, inTransaction, findFirstWaitingTicket, assignTicketToCounter } from '../dao/ticket-dao';
import { findServiceById, getWaitingQueues } from '../dao/service-dao';
import { CreateTicketRequestDTO, CreateTicketResponseDTO, NextCustomerResponseDTO } from '../models/dto/ticket-dto';
import { NotFoundError } from '../models/errors/notfound-error';
import { BadRequestError } from '../models/errors/badrequest-error';
import { ticketEntityToCreateResponseDTO, ticketEntityToNextCustomerResponseDTO } from '../services/mapper-service';

/**
 * Creates a new ticket for the given service in today's queue.
 * @param request The request payload containing the service ID.
 * @returns The created ticket's ID.
 * @throws NotFoundError if the service does not exist.
 */
export const createTicket = (request: CreateTicketRequestDTO): CreateTicketResponseDTO => {
    const service = findServiceById(request.service_id);
    if (!service) {
        throw new NotFoundError("Service not found");
    }

    const today = new Date().toISOString().slice(0, 10);
    const ticket = saveTicket(today, service.id);
    return ticketEntityToCreateResponseDTO(ticket);
};
/**
 * Retrieves the next customer for the given counter ID.
 * @param counterId 
 * @returns A Promise resolving to a TicketDTO or null if no customer is found.
*/
export const getNextCustomer = (counterId: number): NextCustomerResponseDTO | null => {
    if(!Number.isSafeInteger(counterId) || counterId <= 0) {
        throw new BadRequestError("Invalid counter ID");
    }
    return inTransaction(() => {
        // Check if the counter exists
        if (!counterExists(counterId)) {
            throw new NotFoundError("Counter not found");
        }
        const now = new Date();
        // Format the date as 'YYYY-MM-DD'
        const day = [now.getFullYear(),
                        (now.getMonth() + 1).toString().padStart(2, '0'),
                        now.getDate().toString().padStart(2, '0')].join('-');

        const queues = getWaitingQueues(counterId, day);
        queues.sort((a, b) => b.queueLength - a.queueLength || b.serviceTime - a.serviceTime || b.serviceId - a.serviceId);

        const selectedService = queues.length > 0 ? queues[0].serviceId : null;
        if(!selectedService) return null; 

        const ticket = findFirstWaitingTicket(selectedService, day);
        if(!ticket) {
            throw new NotFoundError("Selected queue has no waiting tickets");
        }

        assignTicketToCounter(ticket.id, counterId, day);
        return ticketEntityToNextCustomerResponseDTO(ticket);
    });  
}

   
