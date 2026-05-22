import { apiClient } from "../../../api/api-client";

export interface University {
  id: string;
  name: string;
  email_domain: string;
}

export const authApi = {
  getUniversities: async (): Promise<University[]> => {
    const response = await apiClient.get("/auth/universities");
    return Array.isArray(response.data) ? response.data : (response.data.universities || []);
  },

  register: async (data: any) => {
    return apiClient.post("/auth/register", data);
  }
};
