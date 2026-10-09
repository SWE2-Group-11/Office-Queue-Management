import { ServiceDAO } from '../dao/service-dao';
import { serviceEntityToResponseDTO } from '../services/mapper-service';
import { ServiceDTO } from '../models/dto/service-dto';

export class ServicesController {
    private serviceDAO: ServiceDAO;

    constructor(serviceDAO: ServiceDAO) {
        this.serviceDAO = serviceDAO;
    }

    /**
     * Retrieves the list of all available services as DTOs.
     * Throws errors to be intercepted by the router layer.
     * 
     * @returns A Promise resolving to an array of ServiceDTOs.
     */
    public getAllServices = async (): Promise<ServiceDTO[]> => {
        try {
            const services = this.serviceDAO.listServices();
            const responseDTOs = services.map(service => {
                const dto = serviceEntityToResponseDTO(service);
                return dto!;
            });
            return responseDTOs;
        } catch (error) {
            throw error;
        }
    };
}
