import { Database } from 'better-sqlite3';
import { Service } from '../models/entities/service';
import { Ticket } from '../models/entities/ticket';

export class TicketDAO {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Persists a new ticket record into the database.
     * @param ticket The ticket entity containing the current date and service reference.
     * @returns The newly auto-generated database ID of the inserted record.
     */
    saveTicket(ticket: Ticket): number {
        const sql = `
            INSERT INTO Ticket (day_date, service_id, counter_id)
            VALUES (?, ?, ?)
        `;
        const result = this.db.prepare(sql).run(ticket.day_date, ticket.service_id, ticket.counter_id);
        return Number(result.lastInsertRowid);
    }
}
