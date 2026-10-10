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
