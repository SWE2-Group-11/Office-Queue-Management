import { listServices } from '../dao/service-dao';
import { serviceEntityToDTO } from '../services/mapper-service';
import { ServiceDTO } from '../models/dto/service-dto';

/**
 * Retrieves the list of all available services as DTOs.
 * Errors propagate to the route layer.
 */
export const getAllServices = (): ServiceDTO[] => {
    return listServices().map(serviceEntityToDTO);
};
