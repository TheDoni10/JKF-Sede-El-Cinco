export type AcademicStatus = "activo" | "inactivo";

export type Grade = {
  id: number;
  nombre: string;
  orden: number;
};

export type Period = {
  id: number;
  nombre: string;
  numero: number;
};

export type Student = {
  id: string;
  nombre: string;
  apellidos: string;
  numero_documento: string;
  estado: AcademicStatus;
  created_at: string;
  grado_id: number;
  grados?: Grade | null;
};

export type Teacher = {
  id: string;
  nombre: string;
  apellidos: string;
  numero_documento: string;
  estado: AcademicStatus;
  created_at: string;
};

export type Admin = {
  id: string;
  nombre: string;
  apellidos: string;
  numero_documento: string;
  estado: AcademicStatus;
  created_at: string;
};

export type Subject = {
  id: string;
  nombre: string;
  estado: AcademicStatus;
  created_at: string;
};

export type GradeRecord = {
  id: string;
  nota: number;
  observacion: string | null;
  created_at: string;
  updated_at: string;
  estudiante_id: string;
  materia_id: string;
  periodo_id: number;
  profesor_id: string | null;
  materias?: Subject | null;
  periodos?: Period | null;
  estudiantes?: (Student & { grados?: Grade | null }) | null;
  profesores?: Teacher | null;
};

export type RankingRecord = {
  id: string;
  estudiante_id: string;
  grado_id: number;
  promedio_general: number;
  posicion: number;
  total_estudiantes: number;
  updated_at: string;
};

export type StudentDashboard = {
  student: Student;
  average: number;
  ranking: RankingRecord | null;
  subjects: Array<Subject & { gradeIds?: number[] }>;
  grades: GradeRecord[];
  periodAverages: Array<{ periodo: string; numero: number; promedio: number }>;
  subjectAverages: Array<{ materia: string; promedio: number }>;
  history: Array<{ periodo: string; promedio: number; ranking: number | null; total: number | null }>;
  performance: {
    label: string;
    tone: "success" | "warning" | "danger";
  };
};

export type TeacherOverview = {
  grades: Grade[];
  periods: Period[];
  students: Student[];
  teachers: Teacher[];
  subjects: Array<Subject & { gradeIds: number[] }>;
  notes: GradeRecord[];
  rankings: Array<RankingRecord & { estudiantes?: Student | null }>;
  statsByGrade: Array<{
    grado_id: number;
    grado: string;
    estudiantes: number;
    promedio: number;
    notas: number;
  }>;
};
