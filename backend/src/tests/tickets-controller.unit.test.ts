import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTicket } from "../controllers/tickets-controller";
import { saveTicket } from "../dao/ticket-dao";
import { findServiceById } from "../dao/service-dao";
import { toLocalDate } from "../services/date-service";
import { MAX_TICKET_NUMBER_PER_SERVICE } from "../config/config";
import { Ticket } from "../models/entities/ticket";
import { NotFoundError } from "../models/errors/notfound-error";

/*
UNIT tests for createTicket (Story 1 - Get ticket).
Unit = the controller alone. Both DAO modules and the date service are replaced by
mocks, so there is no database, no HTTP and no dependency on the clock or time zone.
These tests check the business rules only: the existence check, what gets saved,
and how the ticket code "S<service_id> - <number>" is built.
Validation of the request body (missing / non-numeric service_id) is done by the
zod schema + middleware, and is tested in ticket-dto and middleware-service.
How "today" is computed is tested in date-service.
*/

vi.mock("../dao/ticket-dao", () => ({ saveTicket: vi.fn() }));
vi.mock("../dao/service-dao", () => ({ findServiceById: vi.fn() }));
vi.mock("../services/date-service", () => ({ toLocalDate: vi.fn() }));

const TODAY = "2026-10-09";

const saved = (id: number, service_id: number, ticketNumber: number) => ({
    ticket: new Ticket(id, TODAY, service_id, null),
    ticketNumber,
});

describe("createTicket (unit)", () => {
    const deposit = { id: 1, tag_name: "deposit", service_time: 5 };

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(toLocalDate).mockReturnValue(TODAY);
        vi.mocked(findServiceById).mockReturnValue(deposit);
        vi.mocked(saveTicket).mockReturnValue(saved(42, 1, 7));
    });

    it("returns the code of the new ticket as S<service_id> - <daily number>", () => {
        const response = createTicket({ service_id: 1 });

        expect(response).toEqual({ code: "S1 - 7" });
    });

    it("builds the code from the service and the daily number, not from the ticket id", () => {
        vi.mocked(saveTicket).mockReturnValue(saved(42, 1, 3));

        expect(createTicket({ service_id: 1 })).toEqual({ code: "S1 - 3" });
    });

    it("looks the service up by the id in the request", () => {
        createTicket({ service_id: 1 });

        expect(findServiceById).toHaveBeenCalledTimes(1);
        expect(findServiceById).toHaveBeenCalledWith(1);
    });

    it("saves the ticket for today's local date and for the service that was found", () => {
        createTicket({ service_id: 1 });

        expect(toLocalDate).toHaveBeenCalledTimes(1);
        expect(toLocalDate).toHaveBeenCalledWith();
        expect(saveTicket).toHaveBeenCalledTimes(1);
        expect(saveTicket).toHaveBeenCalledWith(TODAY, 1);
    });

    it("puts the ticket in the queue of the requested service", () => {
        vi.mocked(findServiceById).mockReturnValue({ id: 2, tag_name: "shipping", service_time: 8 });
        vi.mocked(saveTicket).mockReturnValue(saved(43, 2, 1));

        const response = createTicket({ service_id: 2 });

        expect(findServiceById).toHaveBeenCalledWith(2);
        expect(saveTicket).toHaveBeenCalledWith(TODAY, 2);
        expect(response).toEqual({ code: "S2 - 1" });
    });

    it("keeps the daily number as is up to the maximum", () => {
        vi.mocked(saveTicket).mockReturnValue(saved(42, 1, MAX_TICKET_NUMBER_PER_SERVICE));

        expect(createTicket({ service_id: 1 })).toEqual({ code: `S1 - ${MAX_TICKET_NUMBER_PER_SERVICE}` });
    });

    it("restarts the daily number from 0 after the maximum", () => {
        vi.mocked(saveTicket).mockReturnValue(saved(42, 1, MAX_TICKET_NUMBER_PER_SERVICE + 1));

        expect(createTicket({ service_id: 1 })).toEqual({ code: "S1 - 0" });
    });

    it("keeps counting from 0 after the restart", () => {
        vi.mocked(saveTicket).mockReturnValue(saved(42, 1, MAX_TICKET_NUMBER_PER_SERVICE + 2));

        expect(createTicket({ service_id: 1 })).toEqual({ code: "S1 - 1" });
    });

    it("rejects an unknown service with 404 'Service not found' and saves nothing", () => {
        vi.mocked(findServiceById).mockReturnValue(null);

        const call = () => createTicket({ service_id: 999 });

        expect(call).toThrow(NotFoundError);
        expect(call).toThrow("Service not found");
        expect(saveTicket).not.toHaveBeenCalled();
    });

    it("lets a database failure through instead of swallowing it", () => {
        const boom = new Error("disk I/O error");
        vi.mocked(saveTicket).mockImplementation(() => {
            throw boom;
        });

        expect(() => createTicket({ service_id: 1 })).toThrow(boom);
    });
});
