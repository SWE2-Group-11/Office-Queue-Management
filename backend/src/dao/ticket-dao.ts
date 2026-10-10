import { db } from "../database/database";
import { Ticket } from '../models/entities/ticket';

/**
 * Persists a new ticket record into the database.
 * @param date The day the ticket belongs to.
 * @param service_id The service the ticket is queued for.
 * @returns The ticket code of the newly ticket.
 */
export const saveTicket = (date: string, service_id: number): number => {
    const executeTransaction = db.transaction((dateParam: string, serviceIdParam: number) => {
        const countSql = "SELECT COUNT(*) as total FROM ticket WHERE date = ? AND service_id = ?";
        const countResult = db.prepare(countSql).get(dateParam, serviceIdParam) as { total: number };
        
        const ticketNumber = countResult.total + 1;

        const insertSql = "INSERT INTO ticket (date, service_id, counter_id) VALUES (?, ?, ?)";
        db.prepare(insertSql).run(dateParam, serviceIdParam, null);

        return ticketNumber;
    });

    return executeTransaction(date, service_id);
};
