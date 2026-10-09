import { Database } from 'better-sqlite3';
import { Service } from '../models/entities/service';

export class ServiceDAO {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Retrieves all available services from the database.
     * Used for the GET /services endpoint.
     * @returns An array of Service entities.
     */
    listServices(): Service[] {
        const sql = `SELECT id, tag_name, service_time FROM Service`;
        return this.db.prepare(sql).all() as Service[];
    }

    /**
     * Retrieves a single service from the database by its unique identifier.
     * @param serviceId The numerical ID of the service type.
     * @returns The Service object if found, or null otherwise.
     */
    findServiceById(serviceId: number): Service | null {
        const sql = `SELECT id, tag_name, service_time FROM Service WHERE id = ?`;
        const row = this.db.prepare(sql).get(serviceId) as Service | undefined;
        return row ? { id: row.id, tag_name: row.tag_name, service_time: row.service_time } : null;
    }
}
