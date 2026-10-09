// src/services/mapper-service.ts
import { ErrorDTO } from '../models/dto/error-dto';
import { ServiceDTO } from '../models/dto/service-dto';
import { Service } from '../models/entities/service';
import { AppError } from '../models/errors/app-error';

/**
 * Maps an operational AppError or a generic internal error into an ErrorDTO instance.
 * Identical to appErrorToDTO from the provided reference.
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
            error.message || "An unexpected error occurred"
        );
    }

    return errorDTO;
};

/**
 * Maps a core Service database entity into a client-ready ServiceDTO instance.
 */
export const serviceEntityToResponseDTO = (service: Service | null): ServiceDTO | null => {
    if (!service) return null;
    return new ServiceDTO(service.id, service.tag_name);
};