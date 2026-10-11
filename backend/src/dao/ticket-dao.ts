import { db } from "../database/database";
import { Ticket } from '../models/entities/ticket';

/**
 * Derives the daily number of a ticket: its position among the tickets
 * of the same day and service, ordered by ID.
 */
export const getTicketNumber = (ticket: Ticket): number => {
    const sql = "SELECT COUNT(*) AS total FROM ticket WHERE date = ? AND service_id = ? AND id <= ?";
    const row = db
        .prepare<[string, number, number], { total: number }>(sql)
        .get(ticket.date, ticket.service_id, ticket.id)!;
    return row.total;
};

    constructor(db: Database) {
        this.db = db;
    }

/**
 * Checks if a counter with the specified ID exists in the database.
 * @param counterId The numerical ID of the counter.
 * @returns True if the counter exists, false otherwise.
 */
export const counterExists = (counterId: number): boolean => {
    return db.prepare('SELECT id FROM Counter WHERE id = ?').get(counterId) !== undefined;
}

/**
 * Finds the first waiting ticket for a given service on a specific day.
 * @param serviceId The numerical ID of the service type.
 * @param day The date in 'YYYY-MM-DD' format.
 * @returns An object containing the ticket ID if found, or null if no waiting ticket exists.
 */
export const findFirstWaitingTicket = (serviceId: number, day: string): Ticket | null => {
    const sql = `
        SELECT id, date, service_id, counter_id
        FROM Ticket 
        WHERE service_id = ? AND date = ? AND counter_id IS NULL 
        ORDER BY id ASC 
        LIMIT 1
    `;
    return db.prepare<[number, string], Ticket>(sql).get(serviceId, day) ?? null;
;
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
        WHERE id = ? AND date = ? AND counter_id IS NULL
    `;
    const result = db.prepare(sql).run(counterId, ticketId, day);
    if (result.changes !== 1) {
        throw new Error(`Ticket cannot be assigned to counter`);
    }
}
