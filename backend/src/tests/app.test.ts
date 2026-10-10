import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app";
import { ROUTES } from "../config/config";
import { db, readSql } from "../database/database";
import { generatePasswordHash } from "../services/password-service";

const INIT_SQL = readSql("init-core.sql");
const DROP_SQL = readSql("drop-core.sql");
const CLEAR_SQL = readSql("clear-core.sql");

beforeAll(() => {
    db.exec(DROP_SQL);
    db.exec(INIT_SQL);   // create the schema once
});

beforeEach(() => {
    db.exec(CLEAR_SQL);  // start each test with empty tables
});

describe("GET /services", () => {
    const login = async () => {
        const { salt, hash } = generatePasswordHash("password");
        db.prepare("INSERT INTO account (username, salt, hash, role) VALUES (?, ?, ?, ?)")
            .run("device", salt, hash, "device");
        const agent = request.agent(app);
        await agent.post(ROUTES.V1_AUTH).send({ username: "device", password: "password" }).expect(201);
        return agent;
    };

    it("returns an empty list when there are no services", async () => {
        const agent = await login();
        const res = await agent.get(ROUTES.V1_SERVICES);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("returns all services as ServiceDTOs", async () => {
        db.exec(`INSERT INTO service (id, tag_name, service_time)
                 VALUES (1, 'deposit', 5), (2, 'shipping', 10)`);
        
        const agent = await login();
        const res = await agent.get(ROUTES.V1_SERVICES);

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/application\/json/);
        expect(res.body).toEqual([
            { id: 1, tag_name: "deposit" },
            { id: 2, tag_name: "shipping" },
        ]);
    });
});