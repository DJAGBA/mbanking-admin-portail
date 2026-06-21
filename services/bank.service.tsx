import axios from '@/lib/axios';
import type { Bank,CreateBankRequest,UpdateBankRequest,CreateServiceRequest,ListBanksResponse,GetBankResponse,} from '@/src/types/bank';
// GET /banks (List with pagination)
export const getBanks = async (page: number = 1, limit: number = 20) => {
  const response = await axios.get<ListBanksResponse>(
    `/banks?page=${page}&limit=${limit}`
  );
  // Extracting the inner "data" object to match the frontend expected structure
  return response.data; 
};
// GET /banks/:id (Single bank details)
export const getBankById = async (id: string) => {
  const response = await axios.get<GetBankResponse>(`/banks/${id}`);
  return response.data.data;
};

// POST /banks (Create a new bank)
export const createBank = async (data: CreateBankRequest) => {
  const response = await axios.post<GetBankResponse>('/banks', data);
  return response.data.data;
};

// PUT /banks/:id (Update an existing bank)
export const updateBank = async (id: string, data: UpdateBankRequest) => {
  const response = await axios.put<GetBankResponse>(`/banks/${id}`, data);
  return response.data.data;
};

// DELETE /banks/:id (Delete a bank)
export const deleteBank = async (id: string) => {
  const response = await axios.delete(`/banks/${id}`);
  return response.data;
};

// POST /banks/:id/services (Add a service to a specific bank)
export const addService = async (id: string, data: CreateServiceRequest) => {
  const response = await axios.post<GetBankResponse>(
    `/banks/${id}/services`,
    data
  );
  return response.data.data;
};

// DELETE /banks/:id/services/:serviceId (Remove a service from a bank)
export const deleteService = async (id: string, serviceId: string) => {
  const response = await axios.delete(`/banks/${id}/services/${serviceId}`);
  return response.data;
};