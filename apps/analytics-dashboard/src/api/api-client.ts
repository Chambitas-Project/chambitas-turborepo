export const apiClient = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  
  async getOverviewKPIs() {
    try {
      const response = await fetch(`${this.baseURL}/analytics/overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      throw error;
    }
  }
};
