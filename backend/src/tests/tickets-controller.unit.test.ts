import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createTicket } from "../controllers/tickets-controller";
import { saveTicket } from "../dao/ticket-dao";
import { findServiceById } from "../dao/service-dao";
import { Ticket } from "../models/entities/ticket";
import { NotFoundError } from "../models/errors/notfound-error";

/*
UNIT tests for createTicket (Story 1 - Get ticket).
Unit = the controller alone. Both DAO modules are replaced by mocks,
so there is no database and no HTTP. These tests check the business rules only:
the existence check, and what gets saved.
Validation of the request body (missing / non-numeric service_id) is done by the
zod schema + middleware, and is tested in ticket-dto and middleware-service.
*/

vi.mock("../dao/ticket-dao", () => ({ saveTicket: vi.fn() }));
vi.mock("../dao/service-dao", () => ({ findServiceById: vi.fn() }));

describe("createTicket (unit)", () => {
    const deposit = { id: 1, tag_name: "deposit", service_time: 5 };

    beforeEach(() => {
        vi.resetAllMocks();
        // Freeze the clock so the "today" date is predictable.
        // The controller takes "today" as the UTC date (toISOString), while the seed uses
        // local time (known issue). The times below are far from midnight, so both agree.
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-09T12:00:00Z"));

        vi.mocked(findServiceById).mockReturnValue(deposit);
        vi.mocked(saveTicket).mockReturnValue(new Ticket(42, "2026-10-09", 1, null));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns the id of the newly created ticket", () => {
        const response = createTicket({ service_id: 1 });

        expect(response).toEqual({ id: 42 });
    });

    it("looks the service up by the id in the request", () => {
        createTicket({ service_id: 1 });

        expect(findServiceById).toHaveBeenCalledTimes(1);
        expect(findServiceById).toHaveBeenCalledWith(1);
    });

    it("saves the ticket for today and for the service that was found", () => {
        createTicket({ service_id: 1 });

        expect(saveTicket).toHaveBeenCalledTimes(1);
        expect(saveTicket).toHaveBeenCalledWith("2026-10-09", 1);
    });

    it("puts the ticket in the queue of the requested service", () => {
        vi.mocked(findServiceById).mockReturnValue({ id: 2, tag_name: "shipping", service_time: 8 });
        vi.mocked(saveTicket).mockReturnValue(new Ticket(43, "2026-10-09", 2, null));

        const response = createTicket({ service_id: 2 });

        expect(findServiceById).toHaveBeenCalledWith(2);
        expect(saveTicket).toHaveBeenCalledWith("2026-10-09", 2);
        expect(response).toEqual({ id: 43 });
    });

    it("uses the date of the day the ticket is taken", () => {
        vi.setSystemTime(new Date("2026-12-31T09:30:00Z"));

        createTicket({ service_id: 1 });

        expect(saveTicket).toHaveBeenCalledWith("2026-12-31", 1);
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
