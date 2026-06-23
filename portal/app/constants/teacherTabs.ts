import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TeacherTab } from "@/app/types/forms";

export type TeacherTabItem = [TeacherTab, string, LucideIcon];

export const TEACHER_TABS: TeacherTabItem[] = [
  ["resumen", "Resumen", BarChart3],
  ["estudiantes", "Estudiantes", Users],
  ["profesores", "Profesores", Users],
  ["materias", "Materias", BookOpen],
  ["notas", "Notas", ClipboardList],
  ["ranking", "Ranking", GraduationCap],
];
