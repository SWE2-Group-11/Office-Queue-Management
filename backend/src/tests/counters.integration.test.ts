import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../app";
import { MAX_TICKET_NUMBER_PER_SERVICE, ROUTES } from "../config/config";
import { db, readSql } from "../database/database";
import { generatePasswordHash } from "../services/password-service";

/*
INTEGRATION tests for PATCH /api/v1/counters/:counterId/next-customer (Story 2 -
Next customer). Nothing is mocked: real Express app + session login + real
controller + real DAOs + the real schema (init-core.sql) on the in-memory
database set up by vitest.

Each test starts from empty tables and inserts only the services, counters,
offers, accounts, and tickets needed for that scenario. Date is frozen so the
tests can distinguish today's waiting queue from tickets on another day.
*/

process.env.TZ = "Europe/Rome";

const INIT_SQL = readSql("init-core.sql");
const DROP_SQL = readSql("drop-core.sql");
const CLEAR_SQL = readSql("clear-core.sql");

const NOW = new Date("2026-10-09T22:30:00.000Z");
const TODAY = "2026-10-10";
const YESTERDAY = "2026-10-09";
const PASSWORD = "password";

type Agent = ReturnType<typeof request.agent>;

const addAccount = (username: string, role: "device" | "manager") => {
    const { salt, hash } = generatePasswordHash(PASSWORD);
    db.prepare("INSERT INTO account (username, salt, hash, role) VALUES (?, ?, ?, ?)").run(username, salt, hash, role);
};

const loginAs = async (username: string): Promise<Agent> => {
    const agent = request.agent(app);
    await agent.post(ROUTES.V1_AUTH).send({ username, password: PASSWORD }).expect(201);
    return agent;
};

const addTicket = (date: string, serviceId: number, counterId: number | null = null) => {
    db.prepare("INSERT INTO ticket (date, service_id, counter_id) VALUES (?, ?, ?)").run(date, serviceId, counterId);
};

const addTickets = (count: number, date: string, serviceId: number, counterId: number | null = null) => {
    for (let i = 0; i < count; i += 1) {
        addTicket(date, serviceId, counterId);
    }
};

const assignedTickets = () =>
    db
        .prepare("SELECT id, service_id, counter_id FROM ticket WHERE counter_id IS NOT NULL ORDER BY id")
        .all() as { id: number; service_id: number; counter_id: number }[];

let device: Agent;

beforeAll(() => {
    db.exec(DROP_SQL);
    db.exec(INIT_SQL);
});

beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    db.exec(CLEAR_SQL);
    db.exec(`INSERT INTO service (id, tag_name, service_time)
             VALUES
                (1, 'deposit', 5),
                (2, 'shipping', 8),
                (3, 'account_management', 12),
                (4, 'unoffered', 20)`);
    db.exec("INSERT INTO counter (id) VALUES (1), (2)");
    db.exec(`INSERT INTO offers (service_id, counter_id)
             VALUES (1, 1), (2, 1), (3, 1), (1, 2)`);
    addAccount("device", "device");
    addAccount("manager", "manager");
    device = await loginAs("device");
});

afterEach(() => {
    vi.useRealTimers();
});

describe("PATCH /api/v1/counters/:counterId/next-customer - success", () => {
    it("returns and assigns the oldest ticket from the counter's only offered queue", async () => {
        addTicket(TODAY, 1);
        addTicket(TODAY, 1);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ code: "S1 - 1" });
        expect(assignedTickets()).toEqual([{ id: 1, service_id: 1, counter_id: 1 }]);
        expect(db.prepare("SELECT counter_id FROM ticket WHERE id = 1").get()).toEqual({ counter_id: 1 });
        expect(db.prepare("SELECT counter_id FROM ticket WHERE id = 2").get()).toEqual({ counter_id: null });
    });

    it("chooses the service with the longest waiting queue", async () => {
        addTicket(TODAY, 1);
        addTicket(TODAY, 2);
        addTicket(TODAY, 2);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.body).toEqual({ code: "S2 - 1" });
        expect(assignedTickets()).toEqual([{ id: 2, service_id: 2, counter_id: 1 }]);
    });

    it("respects counter-specific offers", async () => {
        addTicket(TODAY, 1);
        addTicket(TODAY, 2);
        addTicket(TODAY, 2);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/2/next-customer`);

        expect(res.body).toEqual({ code: "S1 - 1" });
        expect(assignedTickets()).toEqual([{ id: 1, service_id: 1, counter_id: 2 }]);
    });

    it("breaks equal queue lengths with the shorter service time", async () => {
        addTicket(TODAY, 1);
        addTicket(TODAY, 2);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.body).toEqual({ code: "S1 - 1" });
        expect(assignedTickets()).toEqual([{ id: 1, service_id: 1, counter_id: 1 }]);
    });

    it("breaks equal queue lengths and service times with the lower service id", async () => {
        db.prepare("UPDATE service SET service_time = 5 WHERE id = 2").run();
        addTicket(TODAY, 2);
        addTicket(TODAY, 1);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.body).toEqual({ code: "S1 - 1" });
        expect(assignedTickets()).toEqual([{ id: 2, service_id: 1, counter_id: 1 }]);
    });

    it("ignores served tickets, tickets from another day, and services the counter does not offer", async () => {
        addTicket(TODAY, 1, 1);
        addTicket(YESTERDAY, 1);
        addTicket(TODAY, 4);
        addTicket(TODAY, 2);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.body).toEqual({ code: "S2 - 1" });
        expect(assignedTickets()).toEqual([
            { id: 1, service_id: 1, counter_id: 1 },
            { id: 4, service_id: 2, counter_id: 1 },
        ]);
    });

    it("assigns the next oldest ticket on a repeated call", async () => {
        addTicket(TODAY, 1);
        addTicket(TODAY, 1);

        const first = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);
        const second = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(first.body).toEqual({ code: "S1 - 1" });
        expect(second.body).toEqual({ code: "S1 - 2" });
        expect(assignedTickets()).toEqual([
            { id: 1, service_id: 1, counter_id: 1 },
            { id: 2, service_id: 1, counter_id: 1 },
        ]);
        expect(db.prepare("SELECT COUNT(*) AS count FROM ticket WHERE counter_id IS NULL").get()).toEqual({ count: 0 });
    });

    it("includes already served tickets in the daily display number", async () => {
        addTicket(TODAY, 1, 1);
        addTicket(TODAY, 1);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.body).toEqual({ code: "S1 - 2" });
        expect(assignedTickets()).toEqual([
            { id: 1, service_id: 1, counter_id: 1 },
            { id: 2, service_id: 1, counter_id: 1 },
        ]);
    });

    it("wraps the daily display number from 999 to 0", async () => {
        addTickets(MAX_TICKET_NUMBER_PER_SERVICE, TODAY, 1, 1);
        addTicket(TODAY, 1);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.body).toEqual({ code: "S1 - 0" });
        expect(db.prepare("SELECT service_id, counter_id FROM ticket WHERE id = ?").get(MAX_TICKET_NUMBER_PER_SERVICE + 1)).toEqual({
            service_id: 1,
            counter_id: 1,
        });
    });

    it("returns 204 and assigns nothing when no offered queue is waiting", async () => {
        addTicket(YESTERDAY, 1);
        addTicket(TODAY, 1, 1);
        addTicket(TODAY, 4);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.status).toBe(204);
        expect(res.text).toBe("");
        expect(assignedTickets()).toEqual([{ id: 2, service_id: 1, counter_id: 1 }]);
    });
});

describe("PATCH /api/v1/counters/:counterId/next-customer - errors", () => {
    it("answers 404 for an unknown counter and changes no ticket", async () => {
        addTicket(TODAY, 1);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/999/next-customer`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            code: 404,
            name: "NotFoundError",
            message: "Counter not found",
        });
        expect(assignedTickets()).toEqual([]);
    });

    it.each(["0", "-1", "1.5", "abc", "9007199254740992"])(
        "answers 400 for invalid counter id %s",
        async (counterId) => {
            const res = await device.patch(`${ROUTES.V1_COUNTERS}/${counterId}/next-customer`);

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                code: 400,
                name: "BadRequestError",
                message: "Invalid counter ID",
            });
        },
    );

    it("answers 401 without a login", async () => {
        const res = await request(app).patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            code: 401,
            name: "UnauthorizedError",
            message: "Not authenticated",
        });
    });

    it("answers 403 to a manager", async () => {
        const manager = await loginAs("manager");

        const res = await manager.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            code: 403,
            name: "ForbiddenError",
            message: "Not allowed for this role",
        });
    });

    it("answers 401 after the device logs out", async () => {
        await device.delete(`${ROUTES.V1_AUTH}/current`).expect(204);

        const res = await device.patch(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            code: 401,
            name: "UnauthorizedError",
            message: "Not authenticated",
        });
    });

    it("answers 404 for an unsupported method on the counters path", async () => {
        const res = await device.get(`${ROUTES.V1_COUNTERS}/1/next-customer`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            code: 404,
            name: "NotFoundError",
            message: "Route not found",
        });
    });
});
