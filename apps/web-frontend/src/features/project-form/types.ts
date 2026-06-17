export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface SelectedSkill {
  skill_id: string;
  name: string;
  proficiency_level: number;
}

export interface ProjectFormData {
  title: string;
  description: string;
  budget: string;
  service_category: string;
  deadline: string;
  max_hours_week: string;
}
