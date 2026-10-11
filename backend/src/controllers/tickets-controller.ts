import { saveTicket, counterExists, inTransaction, findFirstWaitingTicket, assignTicketToCounter } from '../dao/ticket-dao';
import { findServiceById, getWaitingQueues } from '../dao/service-dao';
import { CreateTicketRequestDTO, CreateTicketResponseDTO, NextCustomerResponseDTO } from '../models/dto/ticket-dto';
import { NotFoundError } from '../models/errors/notfound-error';
import { BadRequestError } from '../models/errors/badrequest-error';
import { ticketDataToCreateResponseDTO, ticketEntityToNextCustomerResponseDTO } from '../services/mapper-service';
import { toLocalDate } from '../services/date-service';
import { MAX_TICKET_NUMBER_PER_SERVICE } from "../config/config";

/**
 * Creates a new ticket for the given service in today's queue.
 * @param request The request payload containing the service ID.
 * @returns The created ticket's code.
 * @throws NotFoundError if the service does not exist.
 */
export const createTicket = (request: CreateTicketRequestDTO): CreateTicketResponseDTO => {
    const service = findServiceById(request.service_id);
    if (!service) {
        throw new NotFoundError("Service not found");
    }

   
    const today = toLocalDate();
    const { ticket, ticketNumber } = saveTicket(today, service.id);
    const displayNumber = ticketNumber % (MAX_TICKET_NUMBER_PER_SERVICE + 1);
    
    return ticketDataToCreateResponseDTO(ticket, displayNumber);
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
        const today = toLocalDate();

        const queues = getWaitingQueues(counterId, today);
        queues.sort((a, b) => b.queueLength - a.queueLength || a.serviceTime - b.serviceTime || a.serviceId - b.serviceId);

        const selectedService = queues.length > 0 ? queues[0].serviceId : null;
        if(!selectedService) return null; 

        const ticket = findFirstWaitingTicket(selectedService, today);
        if(!ticket) {
            throw new NotFoundError("Selected queue has no waiting tickets");
        }

        assignTicketToCounter(ticket.id, counterId, today);
        return ticketEntityToNextCustomerResponseDTO(ticket);
    });  
}