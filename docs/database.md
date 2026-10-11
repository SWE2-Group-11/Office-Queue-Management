# Database

SQLite, accessed with `better-sqlite3`. The DB file path comes from the `DB_PATH` environment variable (default `backend/src/data/database.sqlite`).

## Conceptual schema

![Core schema](img/schema-core.png)

![Auth schema](img/schema-auth.png)

## Logical schema

Primary keys in **bold**, `*` = nullable.

- Service(**id**, tag_name, service_time)
- Counter(**id**)
- Offers(**service_id** → Service, **counter_id** → Counter)
- Ticket(**id**, date, service_id → Service, counter_id\* → Counter)
- Account(**id**, username, salt, hash, role)

## Rules not visible in the diagrams

- `ticket.counter_id` is NULL while the ticket is waiting and is set to the counter that serves it.
- The queue of a service is today's tickets of that service with `counter_id` NULL.
- `ticket.date` is the **local** date `YYYY-MM-DD`. The format is enforced by a CHECK.
- In `ticket`, the composite FK `(service_id, counter_id) → offers` ensures a ticket can only be served by a counter that offers its service. It is checked only once `counter_id` is set: SQLite skips a composite FK when any of its columns is NULL, so waiting tickets are allowed.
- `PRAGMA foreign_keys = ON` must be run on every connection: SQLite disables FKs by default.
- Manager/Device (total, exclusive) is mapped to a single `account` table with a `role` column. All devices share one account.

## SQL scripts (`backend/src/database/sql/`)

| File | Content |
|---|---|
| `drop-core.sql` | Drops all tables |
| `init-core.sql` | Creates `service`, `counter`, `offers`, `ticket`, `account` |
| `seed-core.sql` | 3 services, 3 counters, their configuration, demo tickets (past days + today), demo accounts |
| `clear-core.sql` | Empties all tables (used by tests) |

`RESET_DB=true` runs drop, init and seed at startup.
