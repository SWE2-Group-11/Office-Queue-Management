import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";
import { z } from "zod";
import { validateBody } from "../services/middleware-service";

/*
UNIT tests for validateBody. `req`, `res` and `next` are fakes.
The schema mirrors CreateTicketRequestSchema but is local, so these tests only
depend on the middleware.
*/

const schema = z.object({ service_id: z.number().int().positive() });

const makeRes = () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    return { res: { status } as unknown as Response, status, json };
};

describe("validateBody (unit)", () => {
    it("calls next() and does not answer when the body is valid", () => {
        const { res, status } = makeRes();
        const next = vi.fn();

        validateBody(schema)({ body: { service_id: 2 } } as Request, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(status).not.toHaveBeenCalled();
    });

    it("replaces req.body with the parsed data (unknown fields removed)", () => {
        const req = { body: { service_id: 2, extra: "x" } } as Request;

        validateBody(schema)(req, makeRes().res, vi.fn());

        expect(req.body).toEqual({ service_id: 2 });
    });

    it("answers 400 and does not call next() when the body is invalid", () => {
        const { res, status, json } = makeRes();
        const next = vi.fn();

        validateBody(schema)({ body: { service_id: "abc" } } as Request, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith({
            code: 400,
            name: "BadRequestError",
            message: "service_id: Invalid input: expected number, received string",
        });
    });

    it("names the offending field in the message when it is missing", () => {
        const { res, json } = makeRes();

        validateBody(schema)({ body: {} } as Request, res, vi.fn());

        expect(json).toHaveBeenCalledWith({
            code: 400,
            name: "BadRequestError",
            message: "service_id: Invalid input: expected number, received undefined",
        });
    });

    it("leaves req.body untouched when the body is invalid", () => {
        const req = { body: { service_id: 0 } } as Request;

        validateBody(schema)(req, makeRes().res, vi.fn());

        expect(req.body).toEqual({ service_id: 0 });
    });

    it("answers 400 and does not call next() when there is no body at all", () => {
        const { res, status, json } = makeRes();
        const next = vi.fn();

        validateBody(schema)({ body: undefined } as Request, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith({
            code: 400,
            name: "BadRequestError",
            message: expect.any(String),
        });
    });
});
