/**
 * Base class for operational API errors.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly name: string;

    constructor(statusCode: number, name: string, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = name;
        Object.setPrototypeOf(this, new.target.prototype); // Restores proper prototype chain
    }
}