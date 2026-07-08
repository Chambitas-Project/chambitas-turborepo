import { apiClient } from "./api-client";

export interface ReviewData {
  id: string;
  application_id: string;
  reviewer_id: string;
  reviewer_role: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar_url?: string;
}

export const reviewsApi = {
  createReview: async (data: { application_id: string, rating: number, comment: string }): Promise<ReviewData> => {
    const response = await apiClient.post('/marketplace/reviews', data);
    return response.data;
  },

  listReviews: async (filters: { student_id?: string, employer_id?: string, project_id?: string }): Promise<{ reviews: ReviewData[], average_rating: number }> => {
    const params = new URLSearchParams();
    if (filters.student_id) params.append('student_id', filters.student_id);
    if (filters.employer_id) params.append('employer_id', filters.employer_id);
    if (filters.project_id) params.append('project_id', filters.project_id);

    const response = await apiClient.get(`/marketplace/reviews?${params.toString()}`);
    return {
      reviews: Array.isArray(response.data) ? response.data : (response.data?.reviews || []),
      average_rating: response.data?.average_rating || 0
    };
  }
};
