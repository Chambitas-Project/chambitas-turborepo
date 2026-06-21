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
  },

  async getMLEngineKPIs() {
    try {
      const response = await fetch(`${this.baseURL}/analytics/ml-engine`, {
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
      console.error('Error fetching ML-Engine KPIs:', error);
      throw error;
    }
  },

  async getInfrastructureKPIs() {
    try {
      const response = await fetch(`${this.baseURL}/analytics/infrastructure`, {
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
      console.error('Error fetching Infrastructure KPIs:', error);
      throw error;
    }
  },

  async trackEvent(eventType: string, payload: any, source: string = 'analytics-dashboard') {
    try {
      const response = await fetch(`${this.baseURL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          source,
          userId: '', // Include user context if available
          payload
        })
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending track event:', error);
      throw error;
    }
  }
};
