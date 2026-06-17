export interface ProjectSkill {
  skill_id: string;
  skill_name: string;
  min_proficiency: number;
  mandatory: boolean;
}

export interface Recommendation {
  jobId: string;
  score: number;
  reason: string;
  aiMetadata: string;
  matchId: string;
}

export interface Project {
  id?: string;
  project_id?: string; // Por si viene con project_id
  _id?: string; // MongoDB like (por si acaso)
  title: string;
  description: string;
  budget: number;
  company_name?: string;
  employer_name?: string;
  skills: (string | ProjectSkill)[];
  created_at?: string;
  service_category?: string;
  status?: "active" | "open" | "in_progress" | "closed" | "completed" | "pending" | "draft";
}
