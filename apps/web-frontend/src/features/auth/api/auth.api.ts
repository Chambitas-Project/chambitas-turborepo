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
  },

  /**
   * Inicia el flujo OAuth de Microsoft (Azure AD) para estudiantes.
   * El frontend NO usa Supabase SDK — simplemente redirige al endpoint del API Gateway,
   * que construye la URL de autorización y redirige a Microsoft.
   */
  loginWithAzure: () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
    window.location.href = `${apiBase}/auth/oauth/azure/initiate`;
  },
};
