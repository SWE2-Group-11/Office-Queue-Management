/**
 * Data Transfer Object for Service response payloads.
 * Used in GET /services
 */
export class ServiceDTO {
    public id: number;
    public tag_name: string;

    constructor(id: number, tag_name: string) {
        this.id = id;
        this.tag_name = tag_name;
    }
}