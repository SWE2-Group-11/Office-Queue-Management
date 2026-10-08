import { ServiceDAO } from '../dao/service-dao';
import { serviceEntityToResponseDTO } from '../services/mapper-service';

export class ServicesController {
    private serviceDAO: ServiceDAO;

    constructor(serviceDAO: ServiceDAO) {
        this.serviceDAO = serviceDAO;
    }

    /**
     *  to retrieve the list of all available services.
     */
    public getAllServices = async (): Promise<void> => {
        try{
            const services = this.serviceDAO.listServices();
            const responseDTOs = services.map(service => serviceEntityToResponseDTO(service));
        } catch (error) {
            throw error;
        }

    };
}

