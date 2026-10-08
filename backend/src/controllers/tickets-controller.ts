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
            // 1. Validation check (Throws 400)
            if (service_id === undefined || service_id === null) {
                throw new BadRequestError("The field 'service_id' is required.");
            }

            // 2. Existence check (Throws 404)
            const service = this.serviceDAO.findServiceById(Number(service_id));
            if (!service) {
                throw new NotFoundError("Service not found");
            }

            // 3. Logic execution (Create Ticket)
            const currentDate = new Date().toISOString().split('T')[0];

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
            // Optional: here you could log the error (e.g., logger.error(error))
            // Rethrow the error so that the router/caller can catch it
            throw error;
        }
    };
}


