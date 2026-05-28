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
  applicantCount: number;
  applicantsCount?: number;
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
  studentName?: string;
  student_name?: string;
  student_id?: string;
  cover_note?: string;
  matchScore?: number;
  match_score?: number;
  status: string;
  appliedAt?: string;
  applied_at?: string;
  created_at?: string;
  student_career?: string;
  student_academic_cycle?: number;
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
    return [];
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
