import { describe, expect, it } from "vitest";
import { ticketEntityToNextCustomerResponseDTO } from "../services/mapper-service";
import { Ticket } from "../models/entities/ticket";

describe("ticketEntityToNextCustomerResponseDTO (unit)", () => {
    it("maps the ticket service and display number to the public code", () => {
        const ticket = new Ticket(12, "2026-10-10", 4, 2);

        expect(ticketEntityToNextCustomerResponseDTO(ticket, 6)).toEqual({ code: "S4 - 6" });
    });

    it("does not expose ticket internals", () => {
        const ticket = new Ticket(12, "2026-10-10", 4, 2);

        expect(ticketEntityToNextCustomerResponseDTO(ticket, 6)).toEqual({ code: "S4 - 6" });
        expect(ticketEntityToNextCustomerResponseDTO(ticket, 6)).not.toHaveProperty("id");
        expect(ticketEntityToNextCustomerResponseDTO(ticket, 6)).not.toHaveProperty("counter_id");
        expect(ticketEntityToNextCustomerResponseDTO(ticket, 6)).not.toHaveProperty("date");
    });

    it("preserves a display number of zero", () => {
        const ticket = new Ticket(12, "2026-10-10", 4, 2);

        expect(ticketEntityToNextCustomerResponseDTO(ticket, 0)).toEqual({ code: "S4 - 0" });
    });
});
