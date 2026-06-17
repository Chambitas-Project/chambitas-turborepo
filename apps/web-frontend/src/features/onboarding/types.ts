export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Career {
  id: string;
  name: string;
  area: string;
}

export interface SelectedSkill {
  name: string;
  proficiency_level: number;
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

export const DEFAULT_UNIVERSITY_ID = "59a91332-e18f-4e68-8061-fe83f4c7610f";
