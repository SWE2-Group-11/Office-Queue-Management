/**
 * Data Transfer Object for Ticket response payloads.
 * Used in POST /tickets
 */
export class TicketDTO {
    id: number;

    constructor(id: number) {
        value: this.id = id;
    }
}
