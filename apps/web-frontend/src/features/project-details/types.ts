export interface ProjectSkill {
  skill_id: string;
  skill_name: string;
  min_proficiency: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  company_name?: string;
  employer_name?: string;
  service_category: string;
  requirements?: string;
  skills: ProjectSkill[];
  created_at: string;
  status: string;
  employer_id?: string;
}

export function formatTimeAgo(dateString: string) {
  if (!dateString) return "recientemente";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "hace unos segundos";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} horas`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `hace ${diffInDays} días`;
  return past.toLocaleDateString();
}
