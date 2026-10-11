import { ApiError } from './client';

const BASE_URL = '/api/v1';

export interface CounterServiceSummary {
  name: string;
  next: string;
  avgWait: string;
  count: number;
  icon: string;
}

export interface CounterQueueResponse {
  totalWaiting: number;
  services: CounterServiceSummary[];
}

export interface CalledTicket {
  code: string;
  service_name: string;
  counter_number: number;
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
    let body: any = {};
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


export function callNextTicket(counterId: number): Promise<CalledTicket> {
  return officerRequest<CalledTicket>(`/counters/${counterId}/next`, {
    method: 'POST',
  });
}


export function getCounterQueue(counterId: number): Promise<CounterQueueResponse> {
  return officerRequest<CounterQueueResponse>(`/counters/${counterId}/queue`);
}