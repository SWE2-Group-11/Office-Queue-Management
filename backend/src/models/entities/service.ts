export class Service {
    public id: number;
    public tag_name: string;
    public service_time: number;

    constructor(id: number, tag_name: string, service_time: number) {
        this.id = id;
        this.tag_name = tag_name;
        this.service_time = service_time;
    }
}