import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app";
import { ROUTES } from "../config/config";
import { db, resetDatabase } from "../database/database";

/*
INTEGRATION tests for the hardcoded data (seed-core.sql) and for resetDatabase(),
limited to what Story 1 (Get ticket) needs: the services a customer can choose,
the device account the totem logs in with, and ticket codes that continue after
the tickets seeded for today.
The seed dates its tickets with date('now', 'localtime') and the controller uses the
local date too, so the real clock is used here: both must agree on "today".
*/

const DEMO_PASSWORD = "password"; // README: "All demo accounts have the password `password`."

const all = <T>(sql: string): T[] => db.prepare(sql).all() as T[];
const count = (table: string): number =>
    (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;

const loginAsDevice = async () => {
    const agent = request.agent(app);
    await agent.post(ROUTES.V1_AUTH).send({ username: "device", password: DEMO_PASSWORD }).expect(201);
    return agent;
};

beforeEach(() => {
    resetDatabase();
});

describe("seed data after resetDatabase()", () => {
    it("has the three services with their service times", () => {
        expect(all("SELECT id, tag_name, service_time FROM service ORDER BY id")).toEqual([
            { id: 1, tag_name: "deposit", service_time: 5 },
            { id: 2, tag_name: "shipping", service_time: 8 },
            { id: 3, tag_name: "account_management", service_time: 12 },
        ]);
    });

    it("has a device account that logs in with the documented demo password", async () => {
        const res = await request(app)
            .post(ROUTES.V1_AUTH)
            .send({ username: "device", password: DEMO_PASSWORD });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: expect.any(Number), username: "device", role: "device" });
    });
});

describe("resetDatabase()", () => {
    it("gives the same data when run twice (it does not pile up rows)", () => {
        const before = { services: count("service"), tickets: count("ticket"), accounts: count("account") };

        resetDatabase();
        resetDatabase();

        expect({ services: count("service"), tickets: count("ticket"), accounts: count("account") }).toEqual(before);
    });

    it("removes tickets created since the last reset", async () => {
        const device = await loginAsDevice();
        const before = count("ticket");
        await device.post(ROUTES.V1_TICKETS).send({ service_id: 1 }).expect(200);
        expect(count("ticket")).toBe(before + 1);

        resetDatabase();

        expect(count("ticket")).toBe(before);
    });
});

describe("a customer on the seeded database", () => {
    it("sees the three services and can take a ticket for each", async () => {
        const device = await loginAsDevice();

        const list = await device.get(ROUTES.V1_SERVICES);
        expect(list.body).toEqual([
            { id: 1, tag_name: "deposit" },
            { id: 2, tag_name: "shipping" },
            { id: 3, tag_name: "account_management" },
        ]);

        const before = count("ticket");
        for (const service of list.body as { id: number }[]) {
            const res = await device.post(ROUTES.V1_TICKETS).send({ service_id: service.id });
            expect(res.status).toBe(200);
        }

        expect(count("ticket")).toBe(before + 3);
    });

    it("gets the number after today's seeded tickets of that service", async () => {
        // Seeded for today (served + waiting): deposit 5, shipping 3, account_management 2
        const device = await loginAsDevice();

        const codes: string[] = [];
        for (const service_id of [1, 2, 3]) {
            codes.push((await device.post(ROUTES.V1_TICKETS).send({ service_id })).body.code);
        }

        expect(codes).toEqual(["S1 - 6", "S2 - 4", "S3 - 3"]);
    });

    it("gets 404 for a service that is not in the seed", async () => {
        const device = await loginAsDevice();

        const res = await device.post(ROUTES.V1_TICKETS).send({ service_id: 4 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            code: 404,
            name: "NotFoundError",
            message: "Service not found",
        });
    });
});
