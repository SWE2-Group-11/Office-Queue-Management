export class Ticket {
    public id: number;
    public date: string;     // YYYY-MM-DD
    public service_id: number;
    public counter_id: number | null;

    constructor(id: number, date: string, service_id: number, counter_id: number | null) {
        this.id = id;
        this.date = date;
        this.service_id = service_id;
        this.counter_id = counter_id;
    }
}