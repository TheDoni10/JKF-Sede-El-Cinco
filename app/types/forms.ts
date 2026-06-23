export type LoginMode = "student" | "teacher" | "admin";
export type TeacherTab = "resumen" | "estudiantes" | "profesores" | "materias" | "notas" | "ranking";

export type StudentForm = {
  id: string;
  nombre: string;
  apellidos: string;
  numero_documento: string;
  grado_id: string;
  estado: "activo" | "inactivo";
};

export type TeacherForm = {
  id: string;
  nombre: string;
  apellidos: string;
  numero_documento: string;
  estado: "activo" | "inactivo";
};

export type SubjectForm = {
  id: string;
  nombre: string;
  estado: "activo" | "inactivo";
  gradeIds: number[];
};

export type NoteForm = {
  id: string;
  estudiante_id: string;
  materia_id: string;
  periodo_id: string;
  nota: string;
  observacion: string;
};

export type PeriodForm = {
  id: string;
  nombre: string;
  numero: string;
  estado: "activo" | "inactivo";
};

export const initialStudentForm: StudentForm = {
  id: "",
  nombre: "",
  apellidos: "",
  numero_documento: "",
  grado_id: "",
  estado: "activo",
};

export const initialTeacherForm: TeacherForm = {
  id: "",
  nombre: "",
  apellidos: "",
  numero_documento: "",
  estado: "activo",
};

export const initialSubjectForm: SubjectForm = {
  id: "",
  nombre: "",
  estado: "activo",
  gradeIds: [],
};

export const initialNoteForm: NoteForm = {
  id: "",
  estudiante_id: "",
  materia_id: "",
  periodo_id: "1",
  nota: "",
  observacion: "",
};

export const initialPeriodForm: PeriodForm = {
  id: "",
  nombre: "",
  numero: "1",
  estado: "activo",
};
