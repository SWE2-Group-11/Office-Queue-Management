import { db } from "../database/database";
import { Service } from '../models/entities/service';

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
    const sql = "SELECT id, tag_name, service_time FROM service WHERE id = ?";
    return db.prepare<[number], Service>(sql).get(serviceId) ?? null;
};