"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS, fetchJson } from "@/app/services/academicApi";
import type { GradeRecord, Student, StudentDashboard, Subject, Teacher, TeacherOverview } from "@/app/types/academic";
import {
  initialNoteForm,
  initialStudentForm,
  initialSubjectForm,
  initialTeacherForm,
  type LoginMode,
  type NoteForm,
  type StudentForm,
  type SubjectForm,
  type TeacherForm,
  type TeacherTab,
} from "@/app/types/forms";

export function useAcademicPortal() {
  const [mode, setMode] = useState<LoginMode>("student");
  const [studentDocument, setStudentDocument] = useState("");
  const [teacherDocument, setTeacherDocument] = useState("");
  const [studentDashboard, setStudentDashboard] = useState<StudentDashboard | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [overview, setOverview] = useState<TeacherOverview | null>(null);
  const [teacherTab, setTeacherTab] = useState<TeacherTab>("resumen");
  const [studentForm, setStudentForm] = useState<StudentForm>(initialStudentForm);
  const [teacherForm, setTeacherForm] = useState<TeacherForm>(initialTeacherForm);
  const [subjectForm, setSubjectForm] = useState<SubjectForm>(initialSubjectForm);
  const [noteForm, setNoteForm] = useState<NoteForm>(initialNoteForm);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!overview) return [];
    const needle = search.trim().toLowerCase();
    if (!needle) return overview.students;

    return overview.students.filter((student) =>
      [student.nombre, student.apellidos, student.numero_documento, student.grados?.nombre || ""]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [overview, search]);

  const activeStudents = overview?.students.filter((student) => student.estado === "activo") || [];
  const activeSubjects = overview?.subjects.filter((subject) => subject.estado === "activo") || [];

  const refreshStudent = async () => {
    if (!studentDashboard) return;
    const data = await fetchJson<{ dashboard: StudentDashboard }>(API_ENDPOINTS.reports.student);
    setStudentDashboard(data.dashboard);
  };

  const refreshTeacher = async () => {
    const data = await fetchJson<{ overview: TeacherOverview }>(API_ENDPOINTS.reports.teacher);
    setOverview(data.overview);
  };

  useEffect(() => {
    if (!studentDashboard) return;
    const timer = window.setInterval(() => {
      refreshStudent().catch(() => undefined);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [studentDashboard]);

  const loginStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Consultando estudiante...");
    setLoading(true);

    try {
      const data = await fetchJson<{ dashboard: StudentDashboard }>(API_ENDPOINTS.auth.student, {
        method: "POST",
        body: JSON.stringify({ document: studentDocument }),
      });
      setStudentDashboard(data.dashboard);
      setTeacher(null);
      setOverview(null);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo ingresar.");
    } finally {
      setLoading(false);
    }
  };

  const loginTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Validando profesor...");
    setLoading(true);

    try {
      const data = await fetchJson<{ teacher: Teacher; overview: TeacherOverview }>(API_ENDPOINTS.auth.teacher, {
        method: "POST",
        body: JSON.stringify({ document: teacherDocument }),
      });
      setTeacher(data.teacher);
      setOverview(data.overview);
      setStudentDashboard(null);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo ingresar.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetchJson(API_ENDPOINTS.auth.logout, { method: "POST" }).catch(() => undefined);
    setStudentDashboard(null);
    setTeacher(null);
    setOverview(null);
    setStatus("");
  };

  const saveStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = studentForm.id ? API_ENDPOINTS.students.detail(studentForm.id) : API_ENDPOINTS.students.list;
    const method = studentForm.id ? "PUT" : "POST";

    try {
      await fetchJson(url, { method, body: JSON.stringify(studentForm) });
      setStudentForm(initialStudentForm);
      await refreshTeacher();
      setStatus("Estudiante guardado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar el estudiante.");
    }
  };

  const editStudent = (student: Student) => {
    setStudentForm({
      id: student.id,
      nombre: student.nombre,
      apellidos: student.apellidos,
      numero_documento: student.numero_documento,
      grado_id: String(student.grado_id),
      estado: student.estado,
    });
    setTeacherTab("estudiantes");
  };

  const deleteStudent = async (id: string) => {
    if (!window.confirm("Eliminar este estudiante y sus notas?")) return;
    await fetchJson(API_ENDPOINTS.students.detail(id), { method: "DELETE" });
    await refreshTeacher();
  };

  const saveTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = teacherForm.id ? API_ENDPOINTS.teachers.detail(teacherForm.id) : API_ENDPOINTS.teachers.list;
    const method = teacherForm.id ? "PUT" : "POST";

    try {
      await fetchJson(url, { method, body: JSON.stringify(teacherForm) });
      setTeacherForm(initialTeacherForm);
      await refreshTeacher();
      setStatus("Profesor guardado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar el profesor.");
    }
  };

  const editTeacher = (item: Teacher) => {
    setTeacherForm({
      id: item.id,
      nombre: item.nombre,
      apellidos: item.apellidos,
      numero_documento: item.numero_documento,
      estado: item.estado,
    });
    setTeacherTab("profesores");
  };

  const deleteTeacher = async (id: string) => {
    if (!window.confirm("Eliminar este profesor?")) return;

    try {
      await fetchJson(API_ENDPOINTS.teachers.detail(id), { method: "DELETE" });
      await refreshTeacher();
      setStatus("Profesor eliminado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo eliminar el profesor.");
    }
  };

  const saveSubject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = subjectForm.id ? API_ENDPOINTS.subjects.detail(subjectForm.id) : API_ENDPOINTS.subjects.list;
    const method = subjectForm.id ? "PUT" : "POST";

    try {
      await fetchJson(url, { method, body: JSON.stringify(subjectForm) });
      setSubjectForm(initialSubjectForm);
      await refreshTeacher();
      setStatus("Materia guardada.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la materia.");
    }
  };

  const editSubject = (subject: Subject & { gradeIds: number[] }) => {
    setSubjectForm({
      id: subject.id,
      nombre: subject.nombre,
      estado: subject.estado,
      gradeIds: subject.gradeIds || [],
    });
    setTeacherTab("materias");
  };

  const deleteSubject = async (id: string) => {
    if (!window.confirm("Eliminar esta materia? Las notas asociadas pueden impedir la eliminacion.")) return;
    await fetchJson(API_ENDPOINTS.subjects.detail(id), { method: "DELETE" });
    await refreshTeacher();
  };

  const saveNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = noteForm.id ? API_ENDPOINTS.grades.detail(noteForm.id) : API_ENDPOINTS.grades.list;
    const method = noteForm.id ? "PUT" : "POST";

    try {
      await fetchJson(url, { method, body: JSON.stringify(noteForm) });
      setNoteForm(initialNoteForm);
      await refreshTeacher();
      setStatus("Nota guardada. Promedios y rankings actualizados.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la nota.");
    }
  };

  const editNote = (note: GradeRecord) => {
    setNoteForm({
      id: note.id,
      estudiante_id: note.estudiante_id,
      materia_id: note.materia_id,
      periodo_id: String(note.periodo_id),
      nota: String(note.nota),
      observacion: note.observacion || "",
    });
    setTeacherTab("notas");
  };

  const deleteNote = async (id: string) => {
    if (!window.confirm("Eliminar esta nota?")) return;
    await fetchJson(API_ENDPOINTS.grades.detail(id), { method: "DELETE" });
    await refreshTeacher();
  };

  const toggleSubjectGrade = (gradeId: number) => {
    setSubjectForm((current) => ({
      ...current,
      gradeIds: current.gradeIds.includes(gradeId)
        ? current.gradeIds.filter((id) => id !== gradeId)
        : [...current.gradeIds, gradeId],
    }));
  };

  return {
    mode,
    setMode,
    studentDocument,
    setStudentDocument,
    teacherDocument,
    setTeacherDocument,
    studentDashboard,
    teacher,
    overview,
    teacherTab,
    setTeacherTab,
    studentForm,
    setStudentForm,
    teacherForm,
    setTeacherForm,
    subjectForm,
    setSubjectForm,
    noteForm,
    setNoteForm,
    search,
    setSearch,
    status,
    loading,
    filteredStudents,
    activeStudents,
    activeSubjects,
    refreshStudent,
    refreshTeacher,
    loginStudent,
    loginTeacher,
    logout,
    saveStudent,
    editStudent,
    deleteStudent,
    saveTeacher,
    editTeacher,
    deleteTeacher,
    saveSubject,
    editSubject,
    deleteSubject,
    saveNote,
    editNote,
    deleteNote,
    toggleSubjectGrade,
  };
}
