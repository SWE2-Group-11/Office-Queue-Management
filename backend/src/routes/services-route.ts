import express, { Request, Response } from "express";
import { getAllServices } from "../controllers/services-controller";
import { ServiceDTO } from "../models/dto/service-dto";

const router = express.Router();

router.get("/", (req: Request, res: Response<ServiceDTO[]>) => {
    res.json(getAllServices());
});

export default router;