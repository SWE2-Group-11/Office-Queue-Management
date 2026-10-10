import { db } from "../database/database";
import { Service } from '../models/entities/service';

type ServiceQueue = {
    service: Service;
    serviceTime: number;
    queueLength: number;
};

/**
 * Retrieves all available services from the database.
 * Used for the GET /services endpoint.
 * @returns An array of Service entities.
 */
export const listServices = (): Service[] => {
    const sql = "SELECT id, tag_name, service_time FROM service";
    return db.prepare<[], Service>(sql).all();
};

    /**
     * Retrieves a single service from the database by its unique identifier.
     * @param serviceId The numerical ID of the service type.
     * @returns The Service object if found, or null otherwise.
     */
export const findServiceById = (serviceId: number): Service | null => {
    const sql = `SELECT id, tag_name, service_time FROM Service WHERE id = ?`;
    const row = db.prepare(sql).get(serviceId) as Service | undefined;
    return row ? { id: row.id, tag_name: row.tag_name, service_time: row.service_time } : null;
};

    /**
     * Retrieves the waiting queues for a specific counter on a given day.
     * @param counterId The numerical ID of the counter.
     * @param day The date in 'YYYY-MM-DD' format.
     * @returns An array of ServiceQueue objects, each containing service details and queue length.
     */
export const getWaitingQueues = (counterId: number, day: string): ServiceQueue[] => {
        const sql = `
            SELECT 
                s.id AS serviceId, 
                s.service_time AS serviceTime,
                COUNT(t.id) AS queueLength
            FROM offers o
            JOIN service s ON o.service_id = s.id
            JOIN Ticket t ON s.id = t.service_id
            WHERE o.counter_id = ? AND t.day_date = ? AND t.counter_id IS NULL
            GROUP BY s.id, s.service_time
        `;
        return db.prepare(sql).all(counterId, day) as ServiceQueue[];
}

