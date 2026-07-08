import { apiClient } from "./api-client";

export interface EmployerStats {
  activeJobs: number;
  activeJobsTrend: string;
  newApplicants: number;
  newApplicantsTrend: string;
  pendingReviews: number;
  pendingReviewsTrend: string;
}

export interface EmployerProject {
  id: string;
  title: string;
  description?: string;
  budget?: string | number;
  status: string;
  applicantCount?: number;
  applicantsCount?: number;
  applicant_count?: number;
  contracted?: string | number;
  createdAt: string;
}

export interface ActivityItemData {
  id: string;
  type?: string;
  description?: string;
  timestamp?: string;
  user?: string;
  action?: string;
  target?: string;
  time?: string;
  color?: string;
}

export interface ApplicationData {
  id: string;
  student_name?: string;
  student_id?: string;
  cover_note?: string;
  match_score?: number;
  status: string;
  applied_at?: string;
  created_at?: string;
  student_career?: string;
  student_academic_cycle?: number;
  student_phone?: string;
  student_email?: string;
  student_avatar_url?: string;
}

export const employerApi = {
  getStats: async (): Promise<EmployerStats> => {
    return {
      activeJobs: 0,
      activeJobsTrend: 'Aún sin datos',
      newApplicants: 0,
      newApplicantsTrend: 'Aún sin datos',
      pendingReviews: 0,
      pendingReviewsTrend: 'Aún sin datos'
    };
  },
  getRecentProjects: async (): Promise<EmployerProject[]> => {
    try {
      const response = await apiClient.get('/marketplace/projects/my-projects');
      return Array.isArray(response.data) ? response.data : (response.data?.projects || []);
    } catch (err) {
      console.error("Error fetching recent projects:", err);
      return [];
    }
  },
  getRecentActivity: async (): Promise<ActivityItemData[]> => {
    try {
      const projects = await employerApi.getRecentProjects();
      if (!projects || projects.length === 0) return [];

      const recentProjects = projects.slice(0, 3);
      const allApps: any[] = [];
      for (const p of recentProjects) {
        const apps = await employerApi.getProjectApplicants(p.id);
        allApps.push(...apps.map(a => ({ ...a, projectName: p.title })));
      }

      const sortedApps = allApps.sort((a, b) => new Date(b.created_at || b.applied_at || 0).getTime() - new Date(a.created_at || a.applied_at || 0).getTime()).slice(0, 5);
      
      return sortedApps.map(app => {
        const dateStr = app.created_at || app.applied_at || new Date().toISOString();
        const daysAgo = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
        const timeStr = daysAgo === 0 ? 'hoy' : `hace ${daysAgo} día${daysAgo !== 1 ? 's' : ''}`;
        return {
          id: app.id,
          user: app.student_name || 'Un estudiante',
          action: app.status === 'accepted' ? 'fue aceptado en' : 'postuló a',
          target: app.projectName,
          time: timeStr,
          color: app.status === 'accepted' ? 'emerald' : 'blue'
        };
      });
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      return [];
    }
  },
  getProject: async (id: string): Promise<EmployerProject | null> => {
    try {
      const response = await apiClient.get(`/marketplace/projects/${id}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching project:", err);
      return null;
    }
  },
  getProjectApplicants: async (id: string): Promise<ApplicationData[]> => {
    try {
      const response = await apiClient.get(`/marketplace/applications/project/${id}`);
      return Array.isArray(response.data) ? response.data : (response.data?.applications || []);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      return [];
    }
  },
  createProject: async (data: any): Promise<any> => {
    return apiClient.post('/marketplace/projects', data);
  },
  updateProject: async (projectId: string, data: any): Promise<any> => {
    return apiClient.patch(`/marketplace/projects/${projectId}`, data);
  },
  updateApplicationStatus: async (applicationId: string, status: string): Promise<any> => {
    return apiClient.patch(`/marketplace/applications/${applicationId}/status`, { status });
  },
  getStudentProfile: async (studentId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/profile/id/${studentId}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching student profile:", err);
      return null;
    }
  },
  completeProject: async (projectId: string): Promise<any> => {
    return apiClient.post(`/marketplace/projects/${projectId}/complete`, {});
  }
};
