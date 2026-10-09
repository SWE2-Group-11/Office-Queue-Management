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

    /**
     * Checks if a counter with the specified ID exists in the database.
     * @param counterId The numerical ID of the counter.
     * @returns True if the counter exists, false otherwise.
     */
    counterExists(counterId: number): boolean {
        return this.db.prepare('SELECT id FROM Counter WHERE id = ?').get(counterId) !== undefined;
    }

    /**
     * Funciton to execute a callback within a database transaction.
     * @param callback The function to execute within the transaction. 
     */
    inTransaction<T>(callback: () => T): T {
        return this.db.transaction(callback).immediate();
    }

    /**
     * Finds the first waiting ticket for a given service on a specific day.
     * @param serviceId The numerical ID of the service type.
     * @param day The date in 'YYYY-MM-DD' format.
     * @returns An object containing the ticket ID if found, or null if no waiting ticket exists.
     */
    findFirstWaitingTicket(serviceId: number, day: string): {id: number} | null {
        const sql = `
            SELECT id 
            FROM Ticket 
            WHERE service_id = ? AND day_date = ? AND counter_id IS NULL 
            ORDER BY id ASC 
            LIMIT 1
        `;
        const ticket = this.db.prepare(sql).get(serviceId, day) as {id: number} | undefined;
        return ticket ?? null;
    }

    /**
     * Assigns a ticket to a specific counter for a given day.
     * @param ticketId The numerical ID of the ticket to be assigned.
     * @param counterId The numerical ID of the counter to which the ticket is assigned.
     * @param day The date in 'YYYY-MM-DD' format.
     * @throws Error if the ticket cannot be assigned (e.g., already assigned or does not exist).
     */
    assignTicketToCounter(ticketId: number, counterId: number, day:string): void {
        const sql = `
            UPDATE Ticket 
            SET counter_id = ? 
            WHERE id = ? AND day_date = ? AND counter_id IS NULL
        `;
        const result = this.db.prepare(sql).run(counterId, ticketId, day);
        if (result.changes !== 1) {
            throw new Error(`Ticket cannot be assigned to counter`);
        }
    }
}
