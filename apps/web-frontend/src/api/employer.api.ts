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
  applicantsCount: number;
  createdAt: string;
}

export interface ActivityItemData {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface ApplicationData {
  id: string;
  studentName: string;
  student_id?: string;
  cover_note?: string;
  matchScore: number;
  status: string;
  appliedAt: string;
  created_at?: string;
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
    return [];
  },
  getRecentActivity: async (): Promise<ActivityItemData[]> => {
    return [];
  },
  getProject: async (_id: string): Promise<EmployerProject | null> => {
    return null;
  },
  getProjectApplicants: async (_id: string): Promise<ApplicationData[]> => {
    return [];
  },
  createProject: async (data: any): Promise<any> => {
    return apiClient.post('/marketplace/projects', data);
  }
};
