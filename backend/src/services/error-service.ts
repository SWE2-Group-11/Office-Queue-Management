import { Response } from 'express';
import { AppError } from '../models/errors/app-error';
import { NotFoundError } from '../models/errors/notfound-error';
import { ErrorDTO } from '../models/dto/error-dto';
import { BadRequestError } from '../models/errors/badrequest-error';

/**
 * Core helper that formats any AppError into the official ErrorDTO and sends the HTTP response.
 */
export const sendAppError = (error: AppError, res: Response): Response => {
    const errorDTO: ErrorDTO = {
        code: error.statusCode,
        name: error.name,
        message: error.message
    };
    return res.status(error.statusCode).json(errorDTO);
};

/**
 * Formats and sends an HTTP 404 Not Found error.
 */
export const sendNotFoundError = (message: string, res: Response): Response => {
    const notFoundError = new NotFoundError(message);
    return sendAppError(notFoundError, res);
};


export const sendBadRequestError = (message: string, res: Response): Response => {
    const badRequestError = new BadRequestError(message);
    return sendAppError(badRequestError, res);
};
