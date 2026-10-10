import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { app } from "../app";
import { ROUTES } from "../config/config";
import { db, readSql } from "../database/database";

/*
INTEGRATION tests for POST /api/v1/tickets (Story 1 - Get ticket).
Nothing is mocked: real Express app + real controller + real DAO +
the real schema (init-core.sql) on the in-memory database set up by vitest.
Each test starts from empty tables and inserts only the rows it needs.

Time: only Date is faked, frozen at NOW. The controller computes "today" in UTC
(toISOString), so TODAY is the UTC date of NOW. Note that seed-core.sql uses the
local date instead (known mismatch, not covered here).
*/

const INIT_SQL = readSql("init-core.sql");
const DROP_SQL = readSql("drop-core.sql");
const CLEAR_SQL = readSql("clear-core.sql");

const NOW = new Date("2026-10-09T10:00:00.000Z");
const TODAY = "2026-10-09";

const postTicket = (body: object) => request(app).post(ROUTES.V1_TICKETS).send(body);

const countTickets = (): number =>
    (db.prepare("SELECT COUNT(*) AS n FROM ticket").get() as { n: number }).n;

// A queue is today's waiting tickets (no counter yet) for one service
const waitingFor = (serviceId: number): number =>
    (db
        .prepare("SELECT COUNT(*) AS n FROM ticket WHERE service_id = ? AND date = ? AND counter_id IS NULL")
        .get(serviceId, TODAY) as { n: number }).n;

beforeAll(() => {
    db.exec(DROP_SQL);
    db.exec(INIT_SQL);
});

beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    db.exec(CLEAR_SQL);
    db.exec(`INSERT INTO service (id, tag_name, service_time)
             VALUES (1, 'deposit', 5), (2, 'shipping', 8)`);
});

afterEach(() => {
    vi.useRealTimers();
});

describe("POST /api/v1/tickets - success", () => {
    it("answers 200 with only the id of the new ticket", async () => {
        const res = await postTicket({ service_id: 1 });

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/application\/json/);
        expect(res.body).toEqual({ id: expect.any(Number) });
    });

    it("stores a waiting ticket for today, for that service, with no counter", async () => {
        const res = await postTicket({ service_id: 2 });

        const row = db.prepare("SELECT * FROM ticket WHERE id = ?").get(res.body.id);
        expect(row).toEqual({
            id: res.body.id,
            date: TODAY,
            service_id: 2,
            counter_id: null,
        });
    });

    it("gives every customer a different, increasing id across all services", async () => {
        const ids: number[] = [];
        for (const service_id of [1, 2, 1, 2, 2]) {
            ids.push((await postTicket({ service_id })).body.id);
        }

        expect(new Set(ids).size).toBe(ids.length);
        expect(ids).toEqual([...ids].sort((a, b) => a - b));
    });

    it("adds the ticket only to the chosen service's queue", async () => {
        await postTicket({ service_id: 1 });
        await postTicket({ service_id: 2 });
        await postTicket({ service_id: 2 });

        expect(waitingFor(1)).toBe(1);
        expect(waitingFor(2)).toBe(2);
    });

    it("ignores fields the client should not set", async () => {
        const res = await postTicket({ service_id: 1, counter_id: 3, date: "2000-01-01", id: 42 });

        expect(res.status).toBe(200);
        const row = db.prepare("SELECT id, date, counter_id FROM ticket").get();
        expect(row).toEqual({ id: res.body.id, date: TODAY, counter_id: null });
        expect(res.body.id).not.toBe(42);
    });
});

describe("POST /api/v1/tickets - unknown service", () => {
    it("answers 404 'Service not found' in the error format", async () => {
        const res = await postTicket({ service_id: 999 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            code: 404,
            name: "NotFoundError",
            message: "Service not found",
        });
    });

    it("creates no ticket", async () => {
        await postTicket({ service_id: 999 });

        expect(countTickets()).toBe(0);
    });
});

describe("POST /api/v1/tickets - invalid request", () => {
    it.each([
        ["an empty body", {}],
        ["a missing service_id", { other: 1 }],
        ["a null service_id", { service_id: null }],
        ["a text service_id", { service_id: "abc" }],
        ["a numeric string", { service_id: "1" }],
        ["a boolean service_id", { service_id: true }],
        ["a zero service_id", { service_id: 0 }],
        ["a negative service_id", { service_id: -4 }],
        ["a decimal service_id", { service_id: 1.5 }],
        ["an unsafe integer service_id", { service_id: 2 ** 53 }],
    ])("answers 400 for %s and creates no ticket", async (_label, body) => {
        const res = await postTicket(body);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            code: 400,
            name: "BadRequestError",
            message: expect.stringMatching(/^service_id: /),
        });
        expect(countTickets()).toBe(0);
    });

    it("answers 400 for malformed JSON", async () => {
        const res = await request(app)
            .post(ROUTES.V1_TICKETS)
            .set("Content-Type", "application/json")
            .send('{"service_id": ');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            code: 400,
            name: "BadRequestError",
            message: "Malformed JSON body",
        });
        expect(countTickets()).toBe(0);
    });

    it.each([
        ["no body at all", () => request(app).post(ROUTES.V1_TICKETS)],
        ["a JSON array", () => request(app).post(ROUTES.V1_TICKETS).send([{ service_id: 1 }])],
        ["a non-JSON body", () => request(app).post(ROUTES.V1_TICKETS).set("Content-Type", "text/plain").send("service_id=1")],
    ])("answers 400 for %s and creates no ticket", async (_label, send) => {
        const res = await send();

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            code: 400,
            name: "BadRequestError",
            message: expect.any(String),
        });
        expect(countTickets()).toBe(0);
    });
});

describe("routing", () => {
    it("answers 404 in the error format for GET on the tickets path", async () => {
        const res = await request(app).get(ROUTES.V1_TICKETS);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            code: 404,
            name: "NotFoundError",
            message: "Route not found",
        });
    });
});

describe("GET /api/v1/services then POST /api/v1/tickets (the customer's flow)", () => {
    it("lets a customer take a ticket for any service the list offered", async () => {
        const list = await request(app).get(ROUTES.V1_SERVICES);
        expect(list.body).toHaveLength(2);

        for (const service of list.body as { id: number }[]) {
            const res = await postTicket({ service_id: service.id });
            expect(res.status).toBe(200);
        }

        expect(waitingFor(1)).toBe(1);
        expect(waitingFor(2)).toBe(1);
    });
});
