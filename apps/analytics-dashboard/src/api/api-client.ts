export const apiClient = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  
  async getOverviewKPIs() {
    try {
      const response = await fetch(`${this.baseURL}/analytics/overview`, {
        method: 'GET',
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
  },

  async login(credentials: any) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  },

  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/profile/me`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
};
