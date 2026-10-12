import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import countersRoute from "../routes/counters-route";
import { getNextCustomer } from "../controllers/tickets-controller";
import { sendAppError } from "../services/error-service";

vi.mock("../controllers/tickets-controller", () => ({ getNextCustomer: vi.fn() }));

const app = express();
app.use("/counters", countersRoute);
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    sendAppError(error, response);
});

describe("counters route (unit)", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(getNextCustomer).mockReturnValue({ code: "S2 - 7" });
    });

    it("returns the next customer for a valid counter id", async () => {
        const response = await request(app).patch("/counters/2/next-customer");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ code: "S2 - 7" });
        expect(getNextCustomer).toHaveBeenCalledWith(2);
    });

    it("returns 204 when there is no waiting customer", async () => {
        vi.mocked(getNextCustomer).mockReturnValue(null);

        const response = await request(app).patch("/counters/2/next-customer");

        expect(response.status).toBe(204);
        expect(response.text).toBe("");
    });

    it.each(["0", "-1", "1.5", "abc", "9007199254740992"])(
        "rejects an invalid counter id %s",
        async (counterId) => {
            const response = await request(app).patch(`/counters/${counterId}/next-customer`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                code: 400,
                name: "BadRequestError",
                message: "Invalid counter ID",
            });
            expect(getNextCustomer).not.toHaveBeenCalled();
        },
    );

    it("propagates controller errors to the route error handler", async () => {
        vi.mocked(getNextCustomer).mockImplementation(() => {
            throw new Error("database unavailable");
        });

        const response = await request(app).patch("/counters/2/next-customer");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            code: 500,
            name: "InternalServerError",
            message: "An unexpected error occurred",
        });
    });
});
