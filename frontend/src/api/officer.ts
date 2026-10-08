import { ApiError } from './client';

const BASE_URL = '/api/v1';

// Backend: PATCH /counters/:counterId/next-customer
// 200 -> { code }, 204 -> nobody is waiting
export interface CalledTicket {
  code: string;
}

interface ErrorBody {
  code: number;
  name: string;
  message: string;
}

// Helper function for officer requests
async function officerRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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
      // no JSON body
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

// Returns undefined when there are no customers waiting (HTTP 204)
export function callNextTicket(counterId: number): Promise<CalledTicket | undefined> {
  return officerRequest<CalledTicket | undefined>(`/counters/${counterId}/next-customer`, {
    method: 'PATCH',
  });
}