import { db } from "../database/database";
import { Ticket } from '../models/entities/ticket';

/**
 * Persists a new ticket record into the database.
 * @param date The day the ticket belongs to.
 * @param service_id The service the ticket is queued for.
 * @returns The newly created ticket, including its auto-generated ID.
 */
export const saveTicket = (date: string, service_id: number): Ticket => {
    const sql = "INSERT INTO ticket (date, service_id) VALUES (?, ?)";
    const result = db.prepare(sql).run(date, service_id);
    return new Ticket(Number(result.lastInsertRowid), date, service_id, null);
};

/**
 * Checks if a counter with the specified ID exists in the database.
 * @param counterId The numerical ID of the counter.
 * @returns True if the counter exists, false otherwise.
 */
export const counterExists = (counterId: number): boolean => {
    return db.prepare('SELECT id FROM Counter WHERE id = ?').get(counterId) !== undefined;
}

/**
 * Funciton to execute a callback within a database transaction.
 * @param callback The function to execute within the transaction. 
 */
export const inTransaction = <T>(callback: () => T): T => {
    return db.transaction(callback).immediate();
}

/**
 * Finds the first waiting ticket for a given service on a specific day.
 * @param serviceId The numerical ID of the service type.
 * @param day The date in 'YYYY-MM-DD' format.
 * @returns An object containing the ticket ID if found, or null if no waiting ticket exists.
 */
export const findFirstWaitingTicket = (serviceId: number, day: string): {id: number} | null => {
    const sql = `
        SELECT id 
        FROM Ticket 
        WHERE service_id = ? AND day_date = ? AND counter_id IS NULL 
        ORDER BY id ASC 
        LIMIT 1
    `;
    const ticket = db.prepare(sql).get(serviceId, day) as {id: number} | undefined;
    return ticket ?? null;
}

/**
 * Assigns a ticket to a specific counter for a given day.
 * @param ticketId The numerical ID of the ticket to be assigned.
 * @param counterId The numerical ID of the counter to which the ticket is assigned.
 * @param day The date in 'YYYY-MM-DD' format.
 * @throws Error if the ticket cannot be assigned (e.g., already assigned or does not exist).
 */
export const assignTicketToCounter = (ticketId: number, counterId: number, day:string): void => {
    const sql = `
        UPDATE Ticket 
        SET counter_id = ? 
        WHERE id = ? AND day_date = ? AND counter_id IS NULL
    `;
    const result = db.prepare(sql).run(counterId, ticketId, day);
    if (result.changes !== 1) {
        throw new Error(`Ticket cannot be assigned to counter`);
    }
}

