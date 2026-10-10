// src/services/mapper-service.ts
import { ErrorDTO } from '../models/dto/error-dto';
import { ServiceDTO } from '../models/dto/service-dto';
import { AccountResponseDTO } from '../models/dto/account-dto';
import { CreateTicketResponseDTO } from "../models/dto/ticket-dto";
import { Service } from '../models/entities/service';
import { Account } from '../models/entities/account';
import { AppError } from '../models/errors/app-error';
import { Ticket } from "../models/entities/ticket";

/**
 * Maps an operational AppError or a generic internal error into an ErrorDTO instance.
 */
export const appErrorToDTO = (error: unknown): ErrorDTO => {
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
export const ticketDataToCreateResponseDTO = (ticket: Ticket, displayNumber: number): CreateTicketResponseDTO => {
    return new CreateTicketResponseDTO(`S${ticket.service_id} - ${displayNumber}`);
};


export const accountEntityToResponseDTO = (account: Account): AccountResponseDTO => {
    return new AccountResponseDTO(account.id, account.username, account.role);
}