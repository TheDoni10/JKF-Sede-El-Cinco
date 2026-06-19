import { getSupabaseAdmin } from "./supabaseAdmin";
import type {
  GradeRecord,
  RankingRecord,
  Student,
  StudentDashboard,
  Subject,
  TeacherOverview,
} from "./types";

const roundOne = (value: number) => Math.round(value * 10) / 10;

const average = (values: number[]) => {
  if (!values.length) return 0;
  return roundOne(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const byAverage = <T extends { promedio: number }>(items: T[]) =>
  [...items].sort((a, b) => b.promedio - a.promedio);

const getPerformance = (score: number): StudentDashboard["performance"] => {
  if (score >= 4.2) return { label: "Superior", tone: "success" };
  if (score >= 3.5) return { label: "Alto", tone: "success" };
  if (score >= 3) return { label: "Basico", tone: "warning" };
  return { label: "En seguimiento", tone: "danger" };
};

export const getStudentDashboard = async (document: string): Promise<StudentDashboard> => {
  const supabase = getSupabaseAdmin();

  const { data: student, error: studentError } = await supabase
    .from("estudiantes")
    .select("id,nombre,apellidos,numero_documento,estado,created_at,grado_id,grados(id,nombre,orden)")
    .eq("numero_documento", document)
    .eq("estado", "activo")
    .single();

  if (studentError || !student) {
    throw new Error("No se encontro un estudiante activo con ese documento.");
  }

  const typedStudent = student as Student;

  const [{ data: notes, error: notesError }, { data: gradeSubjects }, { data: ranking }, { data: history }] =
    await Promise.all([
      supabase
        .from("notas")
        .select("id,nota,observacion,created_at,updated_at,estudiante_id,materia_id,periodo_id,profesor_id,materias(id,nombre,estado,created_at),periodos(id,nombre,numero)")
        .eq("estudiante_id", typedStudent.id)
        .order("periodo_id", { ascending: true }),
      supabase
        .from("grado_materias")
        .select("materias(id,nombre,estado,created_at)")
        .eq("grado_id", typedStudent.grado_id),
      supabase
        .from("rankings")
        .select("id,estudiante_id,grado_id,promedio_general,posicion,total_estudiantes,updated_at")
        .eq("estudiante_id", typedStudent.id)
        .maybeSingle(),
      supabase
        .from("historial_academico")
        .select("promedio,ranking,total_estudiantes,periodos(nombre,numero)")
        .eq("estudiante_id", typedStudent.id)
        .order("periodo_id", { ascending: true }),
    ]);

  if (notesError) throw notesError;

  const grades = (notes || []) as GradeRecord[];
  const scores = grades.map((note) => Number(note.nota));
  const generalAverage = average(scores);

  const subjectGroups = new Map<string, number[]>();
  const periodGroups = new Map<string, { numero: number; values: number[] }>();

  grades.forEach((note) => {
    const subject = note.materias?.nombre || "Materia";
    const period = note.periodos?.nombre || `Periodo ${note.periodo_id}`;
    const periodNumber = note.periodos?.numero || note.periodo_id;

    subjectGroups.set(subject, [...(subjectGroups.get(subject) || []), Number(note.nota)]);
    periodGroups.set(period, {
      numero: periodNumber,
      values: [...(periodGroups.get(period)?.values || []), Number(note.nota)],
    });
  });

  const subjectAverages = byAverage(
    Array.from(subjectGroups.entries()).map(([materia, values]) => ({
      materia,
      promedio: average(values),
    }))
  );

  const periodAverages = Array.from(periodGroups.entries())
    .map(([periodo, data]) => ({
      periodo,
      numero: data.numero,
      promedio: average(data.values),
    }))
    .sort((a, b) => a.numero - b.numero);

  const subjects = (gradeSubjects || [])
    .map((item: { materias?: Subject | null }) => item.materias)
    .filter(Boolean) as Subject[];

  return {
    student: typedStudent,
    average: generalAverage,
    ranking: (ranking || null) as RankingRecord | null,
    subjects,
    grades,
    subjectAverages,
    periodAverages,
    history: (history || []).map((item: any) => ({
      periodo: item.periodos?.nombre || "Periodo",
      promedio: Number(item.promedio || 0),
      ranking: item.ranking,
      total: item.total_estudiantes,
    })),
    performance: getPerformance(generalAverage),
  };
};

export const getTeacherOverview = async (): Promise<TeacherOverview> => {
  const supabase = getSupabaseAdmin();

  const [
    gradesResult,
    periodsResult,
    studentsResult,
    teachersResult,
    subjectsResult,
    subjectGradesResult,
    notesResult,
    rankingsResult,
  ] = await Promise.all([
    supabase.from("grados").select("id,nombre,orden").order("orden", { ascending: true }),
    supabase.from("periodos").select("id,nombre,numero").order("numero", { ascending: true }),
    supabase
      .from("estudiantes")
      .select("id,nombre,apellidos,numero_documento,estado,created_at,grado_id,grados(id,nombre,orden)")
      .order("apellidos", { ascending: true }),
    supabase
      .from("profesores")
      .select("id,nombre,apellidos,numero_documento,estado,created_at")
      .order("apellidos", { ascending: true }),
    supabase.from("materias").select("id,nombre,estado,created_at").order("nombre", { ascending: true }),
    supabase.from("grado_materias").select("grado_id,materia_id"),
    supabase
      .from("notas")
      .select("id,nota,observacion,created_at,updated_at,estudiante_id,materia_id,periodo_id,profesor_id,estudiantes(id,nombre,apellidos,numero_documento,estado,created_at,grado_id,grados(id,nombre,orden)),materias(id,nombre,estado,created_at),periodos(id,nombre,numero),profesores(id,nombre,apellidos,numero_documento,estado,created_at)")
      .order("updated_at", { ascending: false }),
    supabase
      .from("rankings")
      .select("id,estudiante_id,grado_id,promedio_general,posicion,total_estudiantes,updated_at,estudiantes(id,nombre,apellidos,numero_documento,estado,created_at,grado_id)")
      .order("posicion", { ascending: true }),
  ]);

  const errors = [
    gradesResult.error,
    periodsResult.error,
    studentsResult.error,
    teachersResult.error,
    subjectsResult.error,
    subjectGradesResult.error,
    notesResult.error,
    rankingsResult.error,
  ].filter(Boolean);

  if (errors.length) throw errors[0];

  const subjectGradeMap = new Map<string, number[]>();
  (subjectGradesResult.data || []).forEach((item: any) => {
    subjectGradeMap.set(item.materia_id, [...(subjectGradeMap.get(item.materia_id) || []), item.grado_id]);
  });

  const subjects = ((subjectsResult.data || []) as Subject[]).map((subject) => ({
    ...subject,
    gradeIds: subjectGradeMap.get(subject.id) || [],
  }));

  const students = (studentsResult.data || []) as Student[];
  const notes = (notesResult.data || []) as GradeRecord[];

  const statsByGrade = ((gradesResult.data || []) as Array<{ id: number; nombre: string; orden: number }>).map(
    (grade) => {
      const gradeStudents = students.filter((student) => student.grado_id === grade.id && student.estado === "activo");
      const gradeStudentIds = new Set(gradeStudents.map((student) => student.id));
      const gradeNotes = notes.filter((note) => gradeStudentIds.has(note.estudiante_id));

      return {
        grado_id: grade.id,
        grado: grade.nombre,
        estudiantes: gradeStudents.length,
        promedio: average(gradeNotes.map((note) => Number(note.nota))),
        notas: gradeNotes.length,
      };
    }
  );

  return {
    grades: gradesResult.data || [],
    periods: periodsResult.data || [],
    students,
    teachers: teachersResult.data || [],
    subjects,
    notes,
    rankings: (rankingsResult.data || []) as TeacherOverview["rankings"],
    statsByGrade,
  };
};
