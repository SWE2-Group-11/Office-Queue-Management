// src/services/mapper-service.ts
import { ErrorDTO } from '../models/dto/error-dto';
import { ServiceDTO } from '../models/dto/service-dto';
import { CreateTicketResponseDTO, NextCustomerResponseDTO } from "../models/dto/ticket-dto";
import { Service } from '../models/entities/service';
import { AppError } from '../models/errors/app-error';
import { Ticket } from "../models/entities/ticket";

/**
 * Maps an operational AppError or a generic internal error into an ErrorDTO instance.
 */
export const appErrorToDTO = (error: any): ErrorDTO => {
    let errorDTO: ErrorDTO;

    if (error instanceof AppError) {
        errorDTO = new ErrorDTO(
            error.statusCode,
            error.name,
            error.message
        );
    } else {
        // Fallback for unhandled internal server errors (500)
        errorDTO = new ErrorDTO(
            500,
            "InternalServerError",
            "An unexpected error occurred"
        );
    }

    return errorDTO;
};

/**
 * Maps a core Service database entity into a client-ready ServiceDTO instance.
 */
export const serviceEntityToDTO = (service: Service): ServiceDTO => {
    return new ServiceDTO(service.id, service.tag_name);
};

/**
 * Maps a core Ticket database entity into a client-ready CreateTicketResponseDTO instance.
 */
export const ticketEntityToCreateResponseDTO = (ticket: Ticket): CreateTicketResponseDTO => {
    return new CreateTicketResponseDTO(ticket.id);
};

export const ticketEntityToNextCustomerResponseDTO = (ticket: Pick<Ticket, 'id'>): NextCustomerResponseDTO => {
    return new NextCustomerResponseDTO(ticket.id);
};