import { saveTicket } from '../dao/ticket-dao';
import { findServiceById } from '../dao/service-dao';
import { CreateTicketRequestDTO, CreateTicketResponseDTO } from '../models/dto/ticket-dto';
import { NotFoundError } from '../models/errors/notfound-error';
import { ticketEntityToCreateResponseDTO } from '../services/mapper-service';

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
}*/
   
