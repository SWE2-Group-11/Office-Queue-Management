import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    assignTicketToCounter,
    counterExists,
    findFirstWaitingTicket,
    getTicketNumber,
} from "../dao/ticket-dao";
import { getWaitingQueues } from "../dao/service-dao";
import { getNextCustomer } from "../controllers/tickets-controller";
import { inTransaction } from "../database/database";
import { toLocalDate } from "../services/date-service";
import { MAX_TICKET_NUMBER_PER_SERVICE } from "../config/config";
import { Ticket } from "../models/entities/ticket";
import { NotFoundError } from "../models/errors/notfound-error";

vi.mock("../dao/ticket-dao", () => ({
    saveTicket: vi.fn(),
    counterExists: vi.fn(),
    findFirstWaitingTicket: vi.fn(),
    assignTicketToCounter: vi.fn(),
    getTicketNumber: vi.fn(),
}));
vi.mock("../dao/service-dao", () => ({
    findServiceById: vi.fn(),
    getWaitingQueues: vi.fn(),
}));
vi.mock("../database/database", () => ({ inTransaction: vi.fn() }));
vi.mock("../services/date-service", () => ({ toLocalDate: vi.fn() }));

const TODAY = "2026-10-10";
const COUNTER_ID = 2;
const waitingTicket = new Ticket(17, TODAY, 3, null);

describe("getNextCustomer (unit)", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(inTransaction).mockImplementation((callback) => callback());
        vi.mocked(counterExists).mockReturnValue(true);
        vi.mocked(toLocalDate).mockReturnValue(TODAY);
        vi.mocked(getWaitingQueues).mockReturnValue([
            { serviceId: 3, serviceTime: 8, queueLength: 2 },
        ]);
        vi.mocked(findFirstWaitingTicket).mockReturnValue(waitingTicket);
        vi.mocked(getTicketNumber).mockReturnValue(4);
    });

    it("runs the selection and assignment in a transaction", () => {
        getNextCustomer(COUNTER_ID);

        expect(inTransaction).toHaveBeenCalledTimes(1);
        expect(counterExists).toHaveBeenCalledWith(COUNTER_ID);
        expect(toLocalDate).toHaveBeenCalledWith();
        expect(getWaitingQueues).toHaveBeenCalledWith(COUNTER_ID, TODAY);
        expect(findFirstWaitingTicket).toHaveBeenCalledWith(3, TODAY);
        expect(assignTicketToCounter).toHaveBeenCalledWith(waitingTicket.id, COUNTER_ID, TODAY);
    });

    it("returns the selected ticket code", () => {
        expect(getNextCustomer(COUNTER_ID)).toEqual({ code: "S3 - 4" });
    });

    it("chooses the queue with the most waiting customers", () => {
        vi.mocked(getWaitingQueues).mockReturnValue([
            { serviceId: 1, serviceTime: 5, queueLength: 2 },
            { serviceId: 2, serviceTime: 10, queueLength: 3 },
        ]);

        getNextCustomer(COUNTER_ID);

        expect(findFirstWaitingTicket).toHaveBeenCalledWith(2, TODAY);
    });

    it("breaks equal queue lengths with the shorter service time", () => {
        vi.mocked(getWaitingQueues).mockReturnValue([
            { serviceId: 1, serviceTime: 10, queueLength: 2 },
            { serviceId: 2, serviceTime: 5, queueLength: 2 },
        ]);

        getNextCustomer(COUNTER_ID);

        expect(findFirstWaitingTicket).toHaveBeenCalledWith(2, TODAY);
    });

    it("breaks equal queue lengths and service times with the lower service id", () => {
        vi.mocked(getWaitingQueues).mockReturnValue([
            { serviceId: 4, serviceTime: 5, queueLength: 2 },
            { serviceId: 2, serviceTime: 5, queueLength: 2 },
        ]);

        getNextCustomer(COUNTER_ID);

        expect(findFirstWaitingTicket).toHaveBeenCalledWith(2, TODAY);
    });

    it("returns null without looking for or assigning a ticket when all queues are empty", () => {
        vi.mocked(getWaitingQueues).mockReturnValue([]);

        expect(getNextCustomer(COUNTER_ID)).toBeNull();
        expect(findFirstWaitingTicket).not.toHaveBeenCalled();
        expect(assignTicketToCounter).not.toHaveBeenCalled();
        expect(getTicketNumber).not.toHaveBeenCalled();
    });

    it("rejects an unknown counter", () => {
        vi.mocked(counterExists).mockReturnValue(false);

        expect(() => getNextCustomer(999)).toThrow(NotFoundError);
        expect(() => getNextCustomer(999)).toThrow("Counter not found");
        expect(getWaitingQueues).not.toHaveBeenCalled();
    });

    it("rejects a queue that disappears before its first ticket is read", () => {
        vi.mocked(findFirstWaitingTicket).mockReturnValue(null);

        expect(() => getNextCustomer(COUNTER_ID)).toThrow(NotFoundError);
        expect(() => getNextCustomer(COUNTER_ID)).toThrow("Selected queue has no waiting tickets");
        expect(assignTicketToCounter).not.toHaveBeenCalled();
    });

    it("wraps the daily ticket number after the configured maximum", () => {
        vi.mocked(getTicketNumber).mockReturnValue(MAX_TICKET_NUMBER_PER_SERVICE + 1);

        expect(getNextCustomer(COUNTER_ID)).toEqual({ code: "S3 - 0" });
    });

    it("propagates assignment failures so the transaction can roll back", () => {
        const failure = new Error("ticket was already assigned");
        vi.mocked(assignTicketToCounter).mockImplementation(() => {
            throw failure;
        });

        expect(() => getNextCustomer(COUNTER_ID)).toThrow(failure);
    });
});
