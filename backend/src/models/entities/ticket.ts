export interface Ticket {
    id?: number;
    day_date: string;     // YYYY-MM-DD
    service_id: number;
    counter_id: number | null;
}