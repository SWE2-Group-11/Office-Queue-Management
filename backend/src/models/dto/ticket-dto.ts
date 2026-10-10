import { z } from "zod";

/**
 * Data Transfer Object for Ticket response payloads.
 * Used in POST /tickets
 */
export class CreateTicketResponseDTO {
    public code: string;

    constructor(code: string) {
        this.code = code;
    }
}

/**
 * Validation schema for Ticket request payloads.
 * Used in POST /tickets
 */
export const CreateTicketRequestSchema = z.object({
    service_id: z.number().int().positive(),
});

/**
 * Data Transfer Object for Ticket request payloads, inferred from the schema.
 */
export type CreateTicketRequestDTO = z.infer<typeof CreateTicketRequestSchema>;