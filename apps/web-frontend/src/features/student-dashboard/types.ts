export interface Profile {
  fullName: string;
  career: string;
  careerId?: string;
  academicCycle: number;
  universityName?: string;
  bio?: string;
  skills?: { name: string; level: number }[];
  gpa?: number;
  weekly_availability?: number;
  availability_blocks?: any;
}

export interface CatalogSkill {
  id: string;
  name: string;
  type?: string;
  category?: string;
}

export const PROFICIENCY_LABELS: Record<number, string> = {
  1: "Principiante",
  2: "Básico",
  3: "Intermedio",
  4: "Avanzado",
  5: "Experto"
};

export const DAYS = [
  { id: "mon", label: "LUN" },
  { id: "tue", label: "MAR" },
  { id: "wed", label: "MIÉ" },
  { id: "thu", label: "JUE" },
  { id: "fri", label: "VIE" },
  { id: "sat", label: "SÁB" },
  { id: "sun", label: "DOM" },
];

export const TIME_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const totalMinutes = 7 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});
