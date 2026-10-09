import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import { ROUTES, CLIENT_ORIGIN } from "./config/config";
import servicesRoute from "./routes/services-route";
import ticketsRoute from "./routes/tickets-route";
import { sendAppError, sendNotFoundError, sendBadRequestError } from "./services/error-service";

// Init express
export const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(cors({
    origin: CLIENT_ORIGIN,
    optionsSuccessStatus: 200,
}));
app.use(express.json());

// Routes
app.use(ROUTES.V1_SERVICES, servicesRoute);
app.use(ROUTES.V1_TICKETS, ticketsRoute);

// Unknown routes → 404 in ErrorDTO format
app.use((req: Request, res: Response) => {
    sendNotFoundError("Route not found", res);
});

// Unhandled errors (e.g. malformed JSON) → ErrorDTO format
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        return sendBadRequestError("Malformed JSON body", res);
    }
    sendAppError(err, res);
});