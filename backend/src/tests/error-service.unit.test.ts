import { describe, it, expect, vi, afterEach } from "vitest";
import type { Response } from "express";
import {
    sendAppError,
    sendNotFoundError,
    sendBadRequestError,
} from "../services/error-service";
import { AppError } from "../models/errors/app-error";

/*
UNIT tests for error-service. Express's `res` is replaced by a fake that
records what was called, so no HTTP server is needed.
*/

const makeRes = () => {
    const json = vi.fn().mockReturnValue("sent");
    const status = vi.fn().mockReturnValue({ json });
    return { res: { status } as unknown as Response, status, json };
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe("sendAppError (unit)", () => {
    it("answers with the error's status code and a { code, name, message } body", () => {
        const { res, status, json } = makeRes();

        sendAppError(new AppError(409, "ConflictError", "already taken"), res);

        expect(status).toHaveBeenCalledWith(409);
        expect(json).toHaveBeenCalledWith({
            code: 409,
            name: "ConflictError",
            message: "already taken",
        });
    });

    it("returns what Express returned, so callers can `return sendAppError(...)`", () => {
        const { res } = makeRes();

        expect(sendAppError(new AppError(500, "X", "y"), res)).toBe("sent");
    });

    it("does not log operational errors (they are expected)", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const { res } = makeRes();

        sendAppError(new AppError(404, "NotFoundError", "nope"), res);

        expect(consoleError).not.toHaveBeenCalled();
    });

    it("answers an unexpected error with a generic 500 and logs the real cause", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const { res, status, json } = makeRes();
        const cause = new Error("SQLITE_ERROR: no such table: ticket");

        sendAppError(cause, res);

        expect(status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith({
            code: 500,
            name: "InternalServerError",
            message: "An unexpected error occurred",
        });
        expect(consoleError).toHaveBeenCalledWith(cause);
    });
});

describe("sendNotFoundError (unit)", () => {
    it("sends a 404 NotFoundError with the given message", () => {
        const { res, status, json } = makeRes();

        sendNotFoundError("Service not found", res);

        expect(status).toHaveBeenCalledWith(404);
        expect(json).toHaveBeenCalledWith({
            code: 404,
            name: "NotFoundError",
            message: "Service not found",
        });
    });
});

describe("sendBadRequestError (unit)", () => {
    it("sends a 400 BadRequestError with the given message", () => {
        const { res, status, json } = makeRes();

        sendBadRequestError("service_id: required", res);

        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith({
            code: 400,
            name: "BadRequestError",
            message: "service_id: required",
        });
    });
});
