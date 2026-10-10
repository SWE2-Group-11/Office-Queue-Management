import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { db, readSql } from "../database/database";
import { listServices, findServiceById } from "../dao/service-dao";
import { saveTicket } from "../dao/ticket-dao";

/*
INTEGRATION tests for the DAOs: the real SQL runs against the real schema
(init-core.sql) on the in-memory database. No mocks.
*/

const INIT_SQL = readSql("init-core.sql");
const DROP_SQL = readSql("drop-core.sql");
const CLEAR_SQL = readSql("clear-core.sql");

beforeAll(() => {
    db.exec(DROP_SQL);
    db.exec(INIT_SQL);
});

beforeEach(() => {
    db.exec(CLEAR_SQL);
});

describe("service-dao on an empty table", () => {
    it("listServices returns an empty list", () => {
        expect(listServices()).toEqual([]);
    });

    it("findServiceById returns null", () => {
        expect(findServiceById(1)).toBeNull();
    });
});

describe("service-dao", () => {
    beforeEach(() => {
        db.exec(`INSERT INTO service (id, tag_name, service_time)
                 VALUES (1, 'deposit', 5), (2, 'shipping', 8), (3, 'account_management', 12)`);
    });

    it("listServices returns every service with its service time", () => {
        expect(listServices()).toEqual([
            { id: 1, tag_name: "deposit", service_time: 5 },
            { id: 2, tag_name: "shipping", service_time: 8 },
            { id: 3, tag_name: "account_management", service_time: 12 },
        ]);
    });

    it("findServiceById returns the matching service", () => {
        expect(findServiceById(2)).toEqual({ id: 2, tag_name: "shipping", service_time: 8 });
    });

    it("findServiceById returns null for an unknown id", () => {
        expect(findServiceById(999)).toBeNull();
    });
});

describe("ticket-dao", () => {
    beforeEach(() => {
        db.exec(`INSERT INTO service (id, tag_name, service_time)
                 VALUES (1, 'deposit', 5), (2, 'shipping', 8)`);
    });

    it("saveTicket stores the row and returns it with its generated id", () => {
        const ticket = saveTicket("2026-10-09", 1);

        expect(ticket).toEqual({ id: expect.any(Number), date: "2026-10-09", service_id: 1, counter_id: null });
        expect(db.prepare("SELECT * FROM ticket WHERE id = ?").get(ticket.id)).toEqual({
            id: ticket.id,
            date: "2026-10-09",
            service_id: 1,
            counter_id: null,
        });
    });

    it("saveTicket gives each ticket a new, larger id", () => {
        const first = saveTicket("2026-10-09", 1);
        const second = saveTicket("2026-10-09", 1);

        expect(second.id).toBeGreaterThan(first.id);
    });

    it("never reuses the id of a ticket that was removed", () => {
        const first = saveTicket("2026-10-09", 1);
        db.prepare("DELETE FROM ticket WHERE id = ?").run(first.id);

        const second = saveTicket("2026-10-09", 1);

        expect(second.id).toBeGreaterThan(first.id);
    });

    it("the database refuses a ticket for a service that does not exist", () => {
        expect(() => saveTicket("2026-10-09", 999)).toThrow(/FOREIGN KEY/i);
    });

    it("the database refuses a date that is not YYYY-MM-DD", () => {
        expect(() => saveTicket("09/10/2026", 1)).toThrow(/CHECK/i);
    });
});
