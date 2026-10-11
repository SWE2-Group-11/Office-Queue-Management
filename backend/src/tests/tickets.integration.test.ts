import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { app } from "../app";
import { ROUTES, MAX_TICKET_NUMBER_PER_SERVICE } from "../config/config";
import { db, readSql } from "../database/database";
import { generatePasswordHash } from "../services/password-service";

/*
INTEGRATION tests for POST /api/v1/tickets (Story 1 - Get ticket).
Nothing is mocked: real Express app + session login + real controller + real DAO +
the real schema (init-core.sql) on the in-memory database set up by vitest.
Each test starts from empty tables and inserts only the rows it needs.

Login: /tickets and /services need a session with the "device" role (the totem).
Each test logs in a fresh supertest agent.

Time: the time zone is Europe/Rome and only Date is faked, frozen at NOW, which is
00:30 local time on 10 October (22:30 UTC on 9 October). A ticket must get the LOCAL
date (docs/database.md), so TODAY is 2026-10-10; a UTC date would be 2026-10-09.
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

const countTickets = (): number =>
    (db.prepare("SELECT COUNT(*) AS n FROM ticket").get() as { n: number }).n;

const lastTicket = () => db.prepare("SELECT * FROM ticket ORDER BY id DESC LIMIT 1").get();

// A queue is today's waiting tickets (no counter yet) for one service
const waitingFor = (serviceId: number): number =>
    (db
        .prepare("SELECT COUNT(*) AS n FROM ticket WHERE service_id = ? AND date = ? AND counter_id IS NULL")
        .get(serviceId, TODAY) as { n: number }).n;

// Inserts `n` tickets for one service and day directly in the DB
const addTickets = (n: number, serviceId: number, date: string) => {
    db.prepare(
        `WITH RECURSIVE seq(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM seq WHERE i < ?)
         INSERT INTO ticket (date, service_id) SELECT ?, ? FROM seq`,
    ).run(n, date, serviceId);
};

let device: Agent;
const postTicket = (body: object) => device.post(ROUTES.V1_TICKETS).send(body);

beforeAll(() => {
    db.exec(DROP_SQL);
    db.exec(INIT_SQL);
});

beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    db.exec(CLEAR_SQL);
    db.exec(`INSERT INTO service (id, tag_name, service_time)
             VALUES (1, 'deposit', 5), (2, 'shipping', 8)`);
    addAccount("device", "device");
    addAccount("manager", "manager");
    device = await loginAs("device");
});

afterEach(() => {
    vi.useRealTimers();
});

describe("POST /api/v1/tickets - success", () => {
    it("answers 200 with only the code of the new ticket", async () => {
        const res = await postTicket({ service_id: 1 });

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/application\/json/);
        expect(res.body).toEqual({ code: "S1 - 1" });
    });

    it("stores a waiting ticket for today's local date, for that service, with no counter", async () => {
        await postTicket({ service_id: 2 });

        expect(lastTicket()).toEqual({
            id: 1,
            date: TODAY,
            service_id: 2,
            counter_id: null,
        });
    });

    it("numbers the tickets of each service separately: 1, 2, 3...", async () => {
        const codes: string[] = [];
        for (const service_id of [1, 2, 1, 2, 2]) {
            codes.push((await postTicket({ service_id })).body.code);
        }

        expect(codes).toEqual(["S1 - 1", "S2 - 1", "S1 - 2", "S2 - 2", "S2 - 3"]);
    });

    it("gives every ticket a different id in the database", async () => {
        for (const service_id of [1, 2, 1]) {
            await postTicket({ service_id });
        }

        const ids = (db.prepare("SELECT id FROM ticket ORDER BY id").all() as { id: number }[]).map((r) => r.id);
        expect(ids).toEqual([1, 2, 3]);
    });

    it("adds the ticket only to the chosen service's queue", async () => {
        await postTicket({ service_id: 1 });
        await postTicket({ service_id: 2 });
        await postTicket({ service_id: 2 });

        expect(waitingFor(1)).toBe(1);
        expect(waitingFor(2)).toBe(2);
    });

    it("starts the numbering again every day", async () => {
        addTickets(3, 1, YESTERDAY);

        const res = await postTicket({ service_id: 1 });

        expect(res.body).toEqual({ code: "S1 - 1" });
    });

    it("counts today's tickets that were already served", async () => {
        db.exec("INSERT INTO counter (id) VALUES (1)");
        db.exec("INSERT INTO offers (service_id, counter_id) VALUES (1, 1)");
        db.prepare("INSERT INTO ticket (date, service_id, counter_id) VALUES (?, 1, 1)").run(TODAY);

        const res = await postTicket({ service_id: 1 });

        expect(res.body).toEqual({ code: "S1 - 2" });
    });

    it("uses the maximum daily number as is", async () => {
        addTickets(MAX_TICKET_NUMBER_PER_SERVICE - 1, 1, TODAY);

        const res = await postTicket({ service_id: 1 });

        expect(res.body).toEqual({ code: `S1 - ${MAX_TICKET_NUMBER_PER_SERVICE}` });
    });

    it("restarts the daily number from 0 after the maximum", async () => {
        addTickets(MAX_TICKET_NUMBER_PER_SERVICE, 1, TODAY);

        const first = await postTicket({ service_id: 1 });
        const second = await postTicket({ service_id: 1 });

        expect([first.body, second.body]).toEqual([{ code: "S1 - 0" }, { code: "S1 - 1" }]);
    });

    it("ignores fields the client should not set", async () => {
        const res = await postTicket({ service_id: 1, counter_id: 3, date: "2000-01-01", id: 42, code: "S9 - 9" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ code: "S1 - 1" });
        expect(lastTicket()).toEqual({ id: 1, date: TODAY, service_id: 1, counter_id: null });
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
        const res = await device
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
        ["no body at all", () => device.post(ROUTES.V1_TICKETS)],
        ["a JSON array", () => device.post(ROUTES.V1_TICKETS).send([{ service_id: 1 }])],
        ["a non-JSON body", () => device.post(ROUTES.V1_TICKETS).set("Content-Type", "text/plain").send("service_id=1")],
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

describe("POST /api/v1/tickets - who may take a ticket", () => {
    it("answers 401 'Not authenticated' without a login and creates no ticket", async () => {
        const res = await request(app).post(ROUTES.V1_TICKETS).send({ service_id: 1 });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            code: 401,
            name: "UnauthorizedError",
            message: "Not authenticated",
        });
        expect(countTickets()).toBe(0);
    });

    it("answers 403 'Not allowed for this role' to a manager and creates no ticket", async () => {
        const manager = await loginAs("manager");

        const res = await manager.post(ROUTES.V1_TICKETS).send({ service_id: 1 });

        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            code: 403,
            name: "ForbiddenError",
            message: "Not allowed for this role",
        });
        expect(countTickets()).toBe(0);
    });

    it("answers 401 after the device logs out", async () => {
        await device.delete(`${ROUTES.V1_AUTH}/current`).expect(204);

        const res = await postTicket({ service_id: 1 });

        expect(res.status).toBe(401);
        expect(countTickets()).toBe(0);
    });
});

describe("routing", () => {
    it("answers 404 in the error format for GET on the tickets path", async () => {
        const res = await device.get(ROUTES.V1_TICKETS);

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
        const list = await device.get(ROUTES.V1_SERVICES);
        expect(list.body).toHaveLength(2);

        const codes: string[] = [];
        for (const service of list.body as { id: number }[]) {
            codes.push((await postTicket({ service_id: service.id })).body.code);
        }

        expect(codes).toEqual(["S1 - 1", "S2 - 1"]);
        expect(waitingFor(1)).toBe(1);
        expect(waitingFor(2)).toBe(1);
    });
});
