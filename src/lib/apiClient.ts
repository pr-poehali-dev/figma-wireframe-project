import { ApiEndpoint, ApiService } from '@/types/api';

const API_SERVICES_URL = 'https://functions.poehali.dev/ee076735-4d31-47d3-ab97-6e0f025d3420';
const API_ENDPOINTS_URL = 'https://functions.poehali.dev/1926781c-0346-4cac-8c6f-edb0153dd1e5';

export const apiClient = {
  async getServices(): Promise<ApiService[]> {
    const response = await fetch(API_SERVICES_URL);
    if (!response.ok) throw new Error('Failed to fetch services');
    const data = await response.json();
    return data.services || [];
  },

  async createService(service: Partial<ApiService>): Promise<{ id: number }> {
    const response = await fetch(API_SERVICES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    });
    if (!response.ok) throw new Error('Failed to create service');
    return response.json();
  },

  async updateService(id: number, service: Partial<ApiService>): Promise<void> {
    const response = await fetch(`${API_SERVICES_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    });
    if (!response.ok) throw new Error('Failed to update service');
  },

  async getEndpoints(filters?: { service_id?: number; status?: string }): Promise<ApiEndpoint[]> {
    let url = API_ENDPOINTS_URL;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.service_id) params.append('service_id', filters.service_id.toString());
      if (filters.status) params.append('status', filters.status);
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch endpoints');
    const data = await response.json();
    return data.endpoints || [];
  },

  async createEndpoint(endpoint: Partial<ApiEndpoint>): Promise<{ id: number }> {
    const response = await fetch(API_ENDPOINTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(endpoint)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create endpoint');
    }
    return response.json();
  },

  async updateEndpoint(id: number, endpoint: Partial<ApiEndpoint>): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(endpoint)
    });
    if (!response.ok) throw new Error('Failed to update endpoint');
  }
};
