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

/**
 * Persists a new ticket record into the database.
 * @param date The day the ticket belongs to.
 * @param service_id The service the ticket is queued for.
 * @returns The newly created ticket and its daily number.
 */
export const saveTicket = (date: string, service_id: number): { ticket: Ticket; ticketNumber: number } =>
    db.transaction(() => {
        const sql = "INSERT INTO ticket (date, service_id) VALUES (?, ?)";
        const result = db.prepare(sql).run(date, service_id);
        const ticket = new Ticket(Number(result.lastInsertRowid), date, service_id, null);
        return { ticket, ticketNumber: getTicketNumber(ticket) };
    })();