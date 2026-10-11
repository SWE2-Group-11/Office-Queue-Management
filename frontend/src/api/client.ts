export interface Service {
  id: number;
  tag_name: string;
}

export interface Ticket {
  code: string;
}

interface ErrorBody {
  code: number;
  name: string;
  message: string;
}

export class ApiError extends Error {
  code: number;
  errorName: string;

  constructor(code: number, errorName: string, message: string) {
    super(message);
    this.code = code;
    this.errorName = errorName;
  }
}

const BASE_URL = '/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let body: Partial<ErrorBody> = {};
    try {
      body = await response.json();
    } catch {
    
    }
    throw new ApiError(
      body.code ?? response.status,
      body.name ?? 'Error',
      body.message ?? response.statusText,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export function getServices(): Promise<Service[]> {
  return request<Service[]>('/services');
}

export function createTicket(serviceId: number): Promise<Ticket> {
  return request<Ticket>('/tickets', {
    method: 'POST',
    body: JSON.stringify({ service_id: serviceId }),
  });
}
export const loginDevice = () =>
  request('/session', {
    method: 'POST',
    body: JSON.stringify({ username: 'device', password: 'password' }),
  });