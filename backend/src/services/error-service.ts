import { Response } from "express";
import { AppError } from "../models/errors/app-error";
import { NotFoundError } from "../models/errors/notfound-error";
import { BadRequestError } from "../models/errors/badrequest-error";
import { appErrorToDTO } from "./mapper-service";

/**
 * Sends any thrown value as an ErrorDTO response.
 * Unexpected errors are logged and returned as a generic 500.
 */
export const sendAppError = (error: unknown, res: Response): Response => {
    if (!(error instanceof AppError)) {
        console.error(error);
    }
    const errorDTO = appErrorToDTO(error);
    return res.status(errorDTO.code).json(errorDTO);
};

/**
 * Formats and sends an HTTP 404 Not Found error.
 */
export const sendNotFoundError = (message: string, res: Response): Response => {
    const notFoundError = new NotFoundError(message);
    return sendAppError(notFoundError, res);
};

/**
 * Formats and sends an HTTP 400 Bad Request error.
 */
export const sendBadRequestError = (message: string, res: Response): Response => {
    const badRequestError = new BadRequestError(message);
    return sendAppError(badRequestError, res);
};
