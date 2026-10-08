import { describe, it, expect } from "vitest";
import request from "supertest";

process.env.DB_PATH = ":memory:";

describe("GET /messages", () => {
  it("returns an empty list", async () => {
    const { app } = await import("./app.js");
    const res = await request(app).get("/messages");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

