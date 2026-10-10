# API

Base URL: `http://localhost:3000/api/v1`

## Services

### `GET /services`

Returns the list of available services.

**200 OK**

```json
[
  { "id": 1, "tag_name": "deposit" },
  { "id": 2, "tag_name": "shipping" }
]
```

## Tickets

### `POST /tickets`

Creates a ticket for a service in today's queue.

**Request**

```json
{ "service_id": 1 }
```

**200 OK**: `id` is the ticket number given to the customer.

```json
{ "code": "S1 - 3" }
```

**404 Not Found**: the service does not exist.
```json
{ "code": 404, "name": "NotFoundError", "message": "Service not found" }
```