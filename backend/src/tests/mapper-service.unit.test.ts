import { describe, it, expect } from "vitest";
import {
    appErrorToDTO,
    serviceEntityToDTO,
    ticketEntityToCreateResponseDTO,
} from "../services/mapper-service";
import { Ticket } from "../models/entities/ticket";
import { AppError } from "../models/errors/app-error";
import { NotFoundError } from "../models/errors/notfound-error";
import { BadRequestError } from "../models/errors/badrequest-error";

/* UNIT tests for the pure mapping functions in mapper-service. */

describe("serviceEntityToDTO (unit)", () => {
    const entity = { id: 2, tag_name: "shipping", service_time: 8 };

    it("maps a service entity to { id, tag_name }", () => {
        expect(serviceEntityToDTO(entity)).toEqual({ id: 2, tag_name: "shipping" });
    });

    it("does not expose service_time", () => {
        expect(serviceEntityToDTO(entity)).not.toHaveProperty("service_time");
    });
});

describe("ticketEntityToCreateResponseDTO (unit)", () => {
    it("maps a ticket entity to { id } only", () => {
        const ticket = new Ticket(7, "2026-10-09", 1, null);

        expect(ticketEntityToCreateResponseDTO(ticket)).toEqual({ id: 7 });
    });
});

describe("appErrorToDTO (unit)", () => {
    it("keeps the status, name and message of a NotFoundError", () => {
        expect(appErrorToDTO(new NotFoundError("Service not found"))).toEqual({
            code: 404,
            name: "NotFoundError",
            message: "Service not found",
        });
    });

    it("keeps the status, name and message of a BadRequestError", () => {
        expect(appErrorToDTO(new BadRequestError("service_id: required"))).toEqual({
            code: 400,
            name: "BadRequestError",
            message: "service_id: required",
        });
    });

    it("keeps the data of a custom AppError", () => {
        expect(appErrorToDTO(new AppError(418, "TeapotError", "short and stout"))).toEqual({
            code: 418,
            name: "TeapotError",
            message: "short and stout",
        });
    });

    it("turns an unexpected Error into a generic 500 and hides its message", () => {
        const dto = appErrorToDTO(new Error("SQLITE_ERROR: no such table: ticket"));

        expect(dto).toEqual({
            code: 500,
            name: "InternalServerError",
            message: "An unexpected error occurred",
        });
    });

    it("also handles things that are not Errors at all", () => {
        expect(appErrorToDTO("oops").code).toBe(500);
        expect(appErrorToDTO(undefined).code).toBe(500);
    });
});

describe("error classes (unit)", () => {
    it("NotFoundError is a 404 AppError with a default message", () => {
        const error = new NotFoundError();

        expect(error).toBeInstanceOf(AppError);
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(404);
        expect(error.name).toBe("NotFoundError");
        expect(error.message).toBe("Resource not found");
    });

    it("BadRequestError is a 400 AppError with a default message", () => {
        const error = new BadRequestError();

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.name).toBe("BadRequestError");
        expect(error.message).toBe("Bad request error");
    });
});
