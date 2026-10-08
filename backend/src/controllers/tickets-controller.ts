import type { Request, Response } from 'express';

export function getNextCustomer(req: Request, res: Response){
    const counterId = Number(req.params.counterId);
    if(Number.isNaN(counterId)) {
        return res.status(400).json({ error: 'Invalid counterId parameter' });
    }
    // TODO: Implement logic to get the next customer for the given counterId
    // example: const nextCustomer = getNextCustomerForCounter(counterId);

    return res.status(501).json({ message: 'Not implemented yet' , counterId}); // to delete when the function is implemented
}