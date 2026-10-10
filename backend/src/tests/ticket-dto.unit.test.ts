import { describe, it, expect } from "vitest";
import { CreateTicketRequestSchema } from "../models/dto/ticket-dto";

/*
UNIT tests for the request schema of POST /tickets.
This is where "a valid service_id" is defined, so it is where the 400 cases live.
*/

describe("CreateTicketRequestSchema (unit)", () => {
    it("accepts a positive integer service_id", () => {
        const result = CreateTicketRequestSchema.safeParse({ service_id: 3 });

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ service_id: 3 });
    });

    it("drops fields it does not know about", () => {
        const result = CreateTicketRequestSchema.safeParse({ service_id: 1, counter_id: 9 });

        expect(result.data).toEqual({ service_id: 1 });
    });

    it.each([
        ["a missing service_id", {}],
        ["null", { service_id: null }],
        ["zero", { service_id: 0 }],
        ["a negative number", { service_id: -1 }],
        ["a decimal", { service_id: 1.5 }],
        ["a numeric string", { service_id: "1" }],
        ["text", { service_id: "abc" }],
        ["a boolean", { service_id: true }],
    ])("rejects %s", (_label, body) => {
        expect(CreateTicketRequestSchema.safeParse(body).success).toBe(false);
    });

    it("rejects a body that is not an object", () => {
        expect(CreateTicketRequestSchema.safeParse(undefined).success).toBe(false);
        expect(CreateTicketRequestSchema.safeParse("1").success).toBe(false);
    });
});
