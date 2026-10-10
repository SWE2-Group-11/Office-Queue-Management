import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app";
import { ROUTES } from "../config/config";
import { db, resetDatabase } from "../database/database";

/*
INTEGRATION tests for the hardcoded data (seed-core.sql) and for resetDatabase(),
limited to what Story 1 (Get ticket) needs: the services a customer can choose
and ticket ids that stay unique on top of the seeded tickets.
*/

const all = <T>(sql: string): T[] => db.prepare(sql).all() as T[];
const count = (table: string): number =>
    (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
const maxTicketId = (): number =>
    (db.prepare("SELECT MAX(id) AS id FROM ticket").get() as { id: number }).id;

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
});

describe("resetDatabase()", () => {
    it("gives the same data when run twice (it does not pile up rows)", () => {
        const before = { services: count("service"), tickets: count("ticket") };

        resetDatabase();
        resetDatabase();

        expect({ services: count("service"), tickets: count("ticket") }).toEqual(before);
    });

    it("removes tickets created since the last reset", async () => {
        const before = count("ticket");
        await request(app).post(ROUTES.V1_TICKETS).send({ service_id: 1 });
        expect(count("ticket")).toBe(before + 1);

        resetDatabase();

        expect(count("ticket")).toBe(before);
    });
});

describe("a customer on the seeded database", () => {
    it("sees the three services and can take a ticket for each", async () => {
        const list = await request(app).get(ROUTES.V1_SERVICES);
        expect(list.body).toEqual([
            { id: 1, tag_name: "deposit" },
            { id: 2, tag_name: "shipping" },
            { id: 3, tag_name: "account_management" },
        ]);

        const before = count("ticket");
        for (const service of list.body as { id: number }[]) {
            const res = await request(app).post(ROUTES.V1_TICKETS).send({ service_id: service.id });
            expect(res.status).toBe(200);
        }

        expect(count("ticket")).toBe(before + 3);
    });

    it("gets a ticket id after every seeded ticket id", async () => {
        const lastSeeded = maxTicketId();

        const res = await request(app).post(ROUTES.V1_TICKETS).send({ service_id: 1 });

        expect(res.body).toEqual({ id: lastSeeded + 1 });
    });

    it("gets 404 for a service that is not in the seed", async () => {
        const res = await request(app).post(ROUTES.V1_TICKETS).send({ service_id: 4 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            code: 404,
            name: "NotFoundError",
            message: "Service not found",
        });
    });
});
