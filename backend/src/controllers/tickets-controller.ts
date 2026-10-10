import { saveTicket } from '../dao/ticket-dao';
import { findServiceById } from '../dao/service-dao';
import { CreateTicketRequestDTO, CreateTicketResponseDTO } from '../models/dto/ticket-dto';
import { NotFoundError } from '../models/errors/notfound-error';
import { ticketDataToCreateResponseDTO } from '../services/mapper-service';

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

    const today = new Date().toISOString().slice(0, 10);
    const ticketNumber = saveTicket(today, service.id);
    
    return ticketDataToCreateResponseDTO(service.id, ticketNumber);
};