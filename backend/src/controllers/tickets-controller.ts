import { saveTicket, counterExists, findFirstWaitingTicket, assignTicketToCounter, getTicketNumber } from '../dao/ticket-dao';
import { findServiceById, getWaitingQueues } from '../dao/service-dao';
import { CreateTicketRequestDTO, CreateTicketResponseDTO, NextCustomerResponseDTO } from '../models/dto/ticket-dto';
import { NotFoundError } from '../models/errors/notfound-error';
import { ticketDataToCreateResponseDTO, ticketEntityToNextCustomerResponseDTO } from '../services/mapper-service';
import { toLocalDate } from '../services/date-service';
import { MAX_TICKET_NUMBER_PER_SERVICE } from "../config/config";
import { inTransaction } from '../database/database';

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
    return inTransaction(() => {
        // Check if the counter exists
        if (!counterExists(counterId)) {
            throw new NotFoundError("Counter not found");
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
