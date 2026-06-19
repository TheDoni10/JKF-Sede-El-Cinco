"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LogOut,
  Pencil,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { GradeRecord, Student, StudentDashboard, Subject, Teacher, TeacherOverview } from "@/lib/types";

type LoginMode = "student" | "teacher";
type TeacherTab = "resumen" | "estudiantes" | "profesores" | "materias" | "notas" | "ranking";

type TeacherTabItem = [TeacherTab, string, LucideIcon];

type StudentForm = {
  id: string;
  nombre: string;
  apellidos: string;
  numero_documento: string;
  grado_id: string;
  estado: "activo" | "inactivo";
};

type TeacherForm = {
  id: string;
  nombre: string;
  apellidos: string;
  numero_documento: string;
  estado: "activo" | "inactivo";
};

type SubjectForm = {
  id: string;
  nombre: string;
  estado: "activo" | "inactivo";
  gradeIds: number[];
};

type NoteForm = {
  id: string;
  estudiante_id: string;
  materia_id: string;
  periodo_id: string;
  nota: string;
  observacion: string;
};

const initialStudentForm: StudentForm = {
  id: "",
  nombre: "",
  apellidos: "",
  numero_documento: "",
  grado_id: "",
  estado: "activo",
};

const initialTeacherForm: TeacherForm = {
  id: "",
  nombre: "",
  apellidos: "",
  numero_documento: "",
  estado: "activo",
};

const initialSubjectForm: SubjectForm = {
  id: "",
  nombre: "",
  estado: "activo",
  gradeIds: [],
};

const initialNoteForm: NoteForm = {
  id: "",
  estudiante_id: "",
  materia_id: "",
  periodo_id: "1",
  nota: "",
  observacion: "",
};

const fetchJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo completar la solicitud.");
  }

  return data as T;
};

const fullName = (person: { nombre: string; apellidos: string }) => `${person.nombre} ${person.apellidos}`.trim();

const formatScore = (score: number | string | null | undefined) => Number(score || 0).toFixed(1);

const scoreWidth = (score: number) => `${Math.max(3, Math.min(100, (score / 5) * 100))}%`;

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "success" | "warning" | "danger";
}) {
  return (
    <article className={`metric ${tone ? `tone-${tone}` : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function BarList({ data, labelKey }: { data: Array<Record<string, string | number>>; labelKey: string }) {
  if (!data.length) return <p className="muted">Aun no hay datos para graficar.</p>;

  return (
    <div className="bar-list">
      {data.map((item) => {
        const label = String(item[labelKey]);
        const value = Number(item.promedio || 0);

        return (
          <div className="bar-row" key={label}>
            <strong>{label}</strong>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: scoreWidth(value) }} />
            </div>
            <span>{formatScore(value)}</span>
          </div>
        );
      })}
    </div>
  );
}

function PeriodChart({ data }: { data: StudentDashboard["periodAverages"] }) {
  if (!data.length) return <p className="muted">Aun no hay periodos con notas.</p>;

  return (
    <div className="period-line">
      {data.map((item) => (
        <div className="period-column" key={item.periodo}>
          <div className="period-stick" style={{ height: `${Math.max(8, (item.promedio / 5) * 190)}px` }} />
          <strong>{formatScore(item.promedio)}</strong>
          <span className="muted">{item.periodo}</span>
        </div>
      ))}
    </div>
  );
}

export default function AcademicPortal() {
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
    const data = await fetchJson<{ dashboard: StudentDashboard }>("/api/academic/student/me");
    setStudentDashboard(data.dashboard);
  };

  const refreshTeacher = async () => {
    const data = await fetchJson<{ overview: TeacherOverview }>("/api/academic/teacher/overview");
    setOverview(data.overview);
  };

  useEffect(() => {
    if (!studentDashboard) return;
    const timer = window.setInterval(() => {
      refreshStudent().catch(() => undefined);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [studentDashboard]);

  const loginStudent = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("Consultando estudiante...");
    setLoading(true);

    try {
      const data = await fetchJson<{ dashboard: StudentDashboard }>("/api/academic/student/login", {
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

  const loginTeacher = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("Validando profesor...");
    setLoading(true);

    try {
      const data = await fetchJson<{ teacher: Teacher; overview: TeacherOverview }>("/api/academic/teacher/login", {
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
    await fetchJson("/api/academic/logout", { method: "POST" }).catch(() => undefined);
    setStudentDashboard(null);
    setTeacher(null);
    setOverview(null);
    setStatus("");
  };

  const saveStudent = async (event: FormEvent) => {
    event.preventDefault();
    const url = studentForm.id ? `/api/academic/students/${studentForm.id}` : "/api/academic/students";
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
    await fetchJson(`/api/academic/students/${id}`, { method: "DELETE" });
    await refreshTeacher();
  };

  const saveTeacher = async (event: FormEvent) => {
    event.preventDefault();
    const url = teacherForm.id ? `/api/academic/teachers/${teacherForm.id}` : "/api/academic/teachers";
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
      await fetchJson(`/api/academic/teachers/${id}`, { method: "DELETE" });
      await refreshTeacher();
      setStatus("Profesor eliminado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo eliminar el profesor.");
    }
  };

  const saveSubject = async (event: FormEvent) => {
    event.preventDefault();
    const url = subjectForm.id ? `/api/academic/subjects/${subjectForm.id}` : "/api/academic/subjects";
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
    await fetchJson(`/api/academic/subjects/${id}`, { method: "DELETE" });
    await refreshTeacher();
  };

  const saveNote = async (event: FormEvent) => {
    event.preventDefault();
    const url = noteForm.id ? `/api/academic/notes/${noteForm.id}` : "/api/academic/notes";
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
    await fetchJson(`/api/academic/notes/${id}`, { method: "DELETE" });
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

  const renderLogin = () => (
    <section className="academic-hero">
      <div className="academic-intro">
        <p className="eyebrow">Sistema academico</p>
        <h1>Portal de estudiantes y profesores</h1>
        <p className="muted">
          Consulta notas, analiza rendimiento, registra calificaciones y administra estudiantes con datos conectados a
          Supabase.
        </p>
      </div>

      <div className="academic-card">
        <div className="tabs" aria-label="Tipo de ingreso">
          <button className={`tab ${mode === "student" ? "active" : ""}`} type="button" onClick={() => setMode("student")}>
            <GraduationCap size={18} /> Estudiante
          </button>
          <button className={`tab ${mode === "teacher" ? "active" : ""}`} type="button" onClick={() => setMode("teacher")}>
            <Users size={18} /> Profesor
          </button>
        </div>

        {mode === "student" ? (
          <form className="form-grid" onSubmit={loginStudent}>
            <label className="field-full">
              Numero de documento
              <input value={studentDocument} onChange={(event) => setStudentDocument(event.target.value)} required />
            </label>
            <button className="button primary field-full" disabled={loading} type="submit">
              <Search size={18} /> Consultar mi portal
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={loginTeacher}>
            <label className="field-full">
              Cedula de profesor
              <input value={teacherDocument} onChange={(event) => setTeacherDocument(event.target.value)} required />
            </label>
            <button className="button primary field-full" disabled={loading} type="submit">
              <Users size={18} /> Entrar como profesor
            </button>
          </form>
        )}
        <p className="status">{status}</p>
      </div>
    </section>
  );

  const renderStudentPortal = (dashboard: StudentDashboard) => (
    <>
      <div className="portal-header">
        <div>
          <p className="eyebrow">Portal de estudiantes</p>
          <h1>{fullName(dashboard.student)}</h1>
          <p className="muted">
            Documento {dashboard.student.numero_documento} - {dashboard.student.grados?.nombre || "Sin grado asignado"}
          </p>
        </div>
        <div className="actions">
          <button className="button ghost" type="button" onClick={() => refreshStudent()}>
            <RefreshCcw size={18} /> Actualizar
          </button>
          <button className="button" type="button" onClick={logout}>
            <LogOut size={18} /> Salir
          </button>
        </div>
      </div>

      <section className="metric-grid">
        <Metric label="Promedio general" value={formatScore(dashboard.average)} tone={dashboard.performance.tone} />
        <Metric label="Ranking del grado" value={dashboard.ranking ? `#${dashboard.ranking.posicion}` : "-"} />
        <Metric label="Total en el grado" value={dashboard.ranking?.total_estudiantes || 0} />
        <Metric label="Desempeno" value={dashboard.performance.label} tone={dashboard.performance.tone} />
      </section>

      <section className="charts-grid">
        <article className="chart-card">
          <h2>Promedio por materia</h2>
          <BarList data={dashboard.subjectAverages} labelKey="materia" />
        </article>
        <article className="chart-card">
          <h2>Evolucion por periodos</h2>
          <PeriodChart data={dashboard.periodAverages} />
        </article>
      </section>

      <section className="dashboard-grid" style={{ marginTop: 14 }}>
        <article className="table-card">
          <h2>Notas por materia</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Periodo</th>
                  <th>Nota</th>
                  <th>Observacion</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.grades.map((note) => (
                  <tr key={note.id}>
                    <td>{note.materias?.nombre || "Materia"}</td>
                    <td>{note.periodos?.nombre || `Periodo ${note.periodo_id}`}</td>
                    <td><strong>{formatScore(note.nota)}</strong></td>
                    <td>{note.observacion || "Sin observacion"}</td>
                  </tr>
                ))}
                {!dashboard.grades.length && (
                  <tr>
                    <td colSpan={4}>Aun no hay notas registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h2>Materias registradas</h2>
          <div className="bar-list">
            {dashboard.subjects.map((subject) => (
              <span className="pill" key={subject.id}>{subject.nombre}</span>
            ))}
            {!dashboard.subjects.length && <p className="muted">Aun no hay materias asignadas.</p>}
          </div>
          <h2 style={{ marginTop: 24 }}>Historial academico</h2>
          <div className="bar-list">
            {dashboard.history.map((item) => (
              <div className="bar-row" key={item.periodo}>
                <strong>{item.periodo}</strong>
                <div className="bar-track"><div className="bar-fill" style={{ width: scoreWidth(item.promedio) }} /></div>
                <span>#{item.ranking || "-"}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );

  const renderTeacherPortal = () => {
    if (!overview || !teacher) return null;

    return (
      <>
        <div className="portal-header">
          <div>
            <p className="eyebrow">Portal de profesores</p>
            <h1>{fullName(teacher)}</h1>
            <p className="muted">Administracion academica completa - Cedula {teacher.numero_documento}</p>
          </div>
          <div className="actions">
            <button className="button ghost" type="button" onClick={() => refreshTeacher()}>
              <RefreshCcw size={18} /> Actualizar
            </button>
            <button className="button" type="button" onClick={logout}>
              <LogOut size={18} /> Salir
            </button>
          </div>
        </div>

        <div className="tabs">
          {([
            ["resumen", "Resumen", BarChart3],
            ["estudiantes", "Estudiantes", Users],
            ["profesores", "Profesores", Users],
            ["materias", "Materias", BookOpen],
            ["notas", "Notas", ClipboardList],
            ["ranking", "Ranking", GraduationCap],
          ] as TeacherTabItem[]).map(([key, label, Icon]) => (
            <button
              className={`tab ${teacherTab === key ? "active" : ""}`}
              key={key}
              type="button"
              onClick={() => setTeacherTab(key)}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        {teacherTab === "resumen" && (
          <>
            <section className="metric-grid">
              <Metric label="Grados" value={overview.grades.length} />
              <Metric label="Estudiantes" value={overview.students.length} />
              <Metric label="Profesores" value={overview.teachers.length} />
              <Metric label="Materias" value={overview.subjects.length} />
              <Metric label="Notas" value={overview.notes.length} />
            </section>
            <section className="chart-card" style={{ marginTop: 14 }}>
              <h2>Rendimiento por grado</h2>
              <BarList data={overview.statsByGrade.map((item) => ({ grado: item.grado, promedio: item.promedio }))} labelKey="grado" />
            </section>
          </>
        )}

        {teacherTab === "estudiantes" && (
          <section className="teacher-grid">
            <form className="form-card form-grid" onSubmit={saveStudent}>
              <h2 className="field-full">{studentForm.id ? "Editar estudiante" : "Crear estudiante"}</h2>
              <label>Nombre<input value={studentForm.nombre} onChange={(event) => setStudentForm({ ...studentForm, nombre: event.target.value })} required /></label>
              <label>Apellidos<input value={studentForm.apellidos} onChange={(event) => setStudentForm({ ...studentForm, apellidos: event.target.value })} required /></label>
              <label>Documento<input value={studentForm.numero_documento} onChange={(event) => setStudentForm({ ...studentForm, numero_documento: event.target.value })} required /></label>
              <label>Grado<select value={studentForm.grado_id} onChange={(event) => setStudentForm({ ...studentForm, grado_id: event.target.value })} required><option value="">Seleccionar</option>{overview.grades.map((grade) => <option value={grade.id} key={grade.id}>{grade.nombre}</option>)}</select></label>
              <label>Estado<select value={studentForm.estado} onChange={(event) => setStudentForm({ ...studentForm, estado: event.target.value as StudentForm["estado"] })}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
              <div className="actions field-full">
                <button className="button primary" type="submit"><Save size={18} /> Guardar</button>
                <button className="button" type="button" onClick={() => setStudentForm(initialStudentForm)}>Limpiar</button>
              </div>
            </form>

            <article className="table-card">
              <div className="search-row">
                <input placeholder="Buscar por nombre, documento o grado" value={search} onChange={(event) => setSearch(event.target.value)} />
                <button className="button ghost" type="button"><Search size={18} /> Buscar</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Estudiante</th><th>Documento</th><th>Grado</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>{fullName(student)}</td>
                        <td>{student.numero_documento}</td>
                        <td>{student.grados?.nombre || "-"}</td>
                        <td><span className={`pill ${student.estado === "inactivo" ? "inactive" : ""}`}>{student.estado}</span></td>
                        <td className="actions">
                          <button className="button ghost" type="button" onClick={() => editStudent(student)}><Pencil size={16} /></button>
                          <button className="button" type="button" onClick={() => deleteStudent(student.id)}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        )}

        {teacherTab === "profesores" && (
          <section className="teacher-grid">
            <form className="form-card form-grid" onSubmit={saveTeacher}>
              <h2 className="field-full">{teacherForm.id ? "Editar profesor" : "Crear profesor"}</h2>
              <label>Nombre<input value={teacherForm.nombre} onChange={(event) => setTeacherForm({ ...teacherForm, nombre: event.target.value })} required /></label>
              <label>Apellidos<input value={teacherForm.apellidos} onChange={(event) => setTeacherForm({ ...teacherForm, apellidos: event.target.value })} required /></label>
              <label>Cedula<input value={teacherForm.numero_documento} onChange={(event) => setTeacherForm({ ...teacherForm, numero_documento: event.target.value })} required /></label>
              <label>Estado<select value={teacherForm.estado} onChange={(event) => setTeacherForm({ ...teacherForm, estado: event.target.value as TeacherForm["estado"] })}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
              <div className="actions field-full">
                <button className="button primary" type="submit"><Save size={18} /> Guardar</button>
                <button className="button" type="button" onClick={() => setTeacherForm(initialTeacherForm)}>Limpiar</button>
              </div>
            </form>

            <article className="table-card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Profesor</th><th>Cedula</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {overview.teachers.map((item) => (
                      <tr key={item.id}>
                        <td>{fullName(item)}</td>
                        <td>{item.numero_documento}</td>
                        <td><span className={`pill ${item.estado === "inactivo" ? "inactive" : ""}`}>{item.estado}</span></td>
                        <td className="actions">
                          <button className="button ghost" type="button" onClick={() => editTeacher(item)}><Pencil size={16} /></button>
                          <button className="button" type="button" onClick={() => deleteTeacher(item.id)}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {!overview.teachers.length && (
                      <tr>
                        <td colSpan={4}>Aun no hay profesores registrados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        )}

        {teacherTab === "materias" && (
          <section className="teacher-grid">
            <form className="form-card form-grid" onSubmit={saveSubject}>
              <h2 className="field-full">{subjectForm.id ? "Editar materia" : "Crear materia"}</h2>
              <label className="field-full">Nombre<input value={subjectForm.nombre} onChange={(event) => setSubjectForm({ ...subjectForm, nombre: event.target.value })} required /></label>
              <label className="field-full">Estado<select value={subjectForm.estado} onChange={(event) => setSubjectForm({ ...subjectForm, estado: event.target.value as SubjectForm["estado"] })}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
              <div className="field-full">
                <strong>Asignar a grados</strong>
                <div className="checkbox-grid">
                  {overview.grades.map((grade) => (
                    <label className="checkbox-row" key={grade.id}>
                      <input type="checkbox" checked={subjectForm.gradeIds.includes(grade.id)} onChange={() => toggleSubjectGrade(grade.id)} />
                      {grade.nombre}
                    </label>
                  ))}
                </div>
              </div>
              <div className="actions field-full">
                <button className="button primary" type="submit"><Save size={18} /> Guardar</button>
                <button className="button" type="button" onClick={() => setSubjectForm(initialSubjectForm)}>Limpiar</button>
              </div>
            </form>

            <article className="table-card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Materia</th><th>Grados</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {overview.subjects.map((subject) => (
                      <tr key={subject.id}>
                        <td>{subject.nombre}</td>
                        <td>{subject.gradeIds.length}</td>
                        <td><span className={`pill ${subject.estado === "inactivo" ? "inactive" : ""}`}>{subject.estado}</span></td>
                        <td className="actions">
                          <button className="button ghost" type="button" onClick={() => editSubject(subject)}><Pencil size={16} /></button>
                          <button className="button" type="button" onClick={() => deleteSubject(subject.id)}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        )}

        {teacherTab === "notas" && (
          <section className="teacher-grid">
            <form className="form-card form-grid" onSubmit={saveNote}>
              <h2 className="field-full">{noteForm.id ? "Modificar nota" : "Registrar nota"}</h2>
              <label className="field-full">Estudiante<select value={noteForm.estudiante_id} onChange={(event) => setNoteForm({ ...noteForm, estudiante_id: event.target.value })} required><option value="">Seleccionar</option>{activeStudents.map((student) => <option value={student.id} key={student.id}>{fullName(student)} - {student.grados?.nombre}</option>)}</select></label>
              <label>Materia<select value={noteForm.materia_id} onChange={(event) => setNoteForm({ ...noteForm, materia_id: event.target.value })} required><option value="">Seleccionar</option>{activeSubjects.map((subject) => <option value={subject.id} key={subject.id}>{subject.nombre}</option>)}</select></label>
              <label>Periodo<select value={noteForm.periodo_id} onChange={(event) => setNoteForm({ ...noteForm, periodo_id: event.target.value })}>{overview.periods.map((period) => <option value={period.id} key={period.id}>{period.nombre}</option>)}</select></label>
              <label>Nota<input type="number" min="0" max="5" step="0.1" value={noteForm.nota} onChange={(event) => setNoteForm({ ...noteForm, nota: event.target.value })} required /></label>
              <label className="field-full">Observacion<textarea value={noteForm.observacion} onChange={(event) => setNoteForm({ ...noteForm, observacion: event.target.value })} /></label>
              <div className="actions field-full">
                <button className="button primary" type="submit"><Save size={18} /> Guardar nota</button>
                <button className="button" type="button" onClick={() => setNoteForm(initialNoteForm)}>Limpiar</button>
              </div>
            </form>

            <article className="table-card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Estudiante</th><th>Materia</th><th>Periodo</th><th>Nota</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {overview.notes.map((note) => (
                      <tr key={note.id}>
                        <td>{note.estudiantes ? fullName(note.estudiantes) : "-"}</td>
                        <td>{note.materias?.nombre || "-"}</td>
                        <td>{note.periodos?.nombre || "-"}</td>
                        <td><strong>{formatScore(note.nota)}</strong></td>
                        <td className="actions">
                          <button className="button ghost" type="button" onClick={() => editNote(note)}><Pencil size={16} /></button>
                          <button className="button" type="button" onClick={() => deleteNote(note.id)}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        )}

        {teacherTab === "ranking" && (
          <section className="table-card">
            <h2>Ranking de estudiantes</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Posicion</th><th>Estudiante</th><th>Grado</th><th>Promedio</th><th>Total grado</th></tr></thead>
                <tbody>
                  {overview.rankings.map((rank) => (
                    <tr key={rank.id}>
                      <td><strong>#{rank.posicion}</strong></td>
                      <td>{rank.estudiantes ? fullName(rank.estudiantes) : rank.estudiante_id}</td>
                      <td>{overview.grades.find((grade) => grade.id === rank.grado_id)?.nombre || "-"}</td>
                      <td>{formatScore(rank.promedio_general)}</td>
                      <td>{rank.total_estudiantes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        <p className="status">{status}</p>
      </>
    );
  };

  return (
    <main className="academic-shell">
      <header className="academic-topbar">
        <div className="academic-brand">
          <div className="academic-mark">JFK</div>
          <div>
            <strong>John F Kennedy</strong>
            <span>Sede El Cinco - Sistema academico</span>
          </div>
        </div>
        <a className="button ghost" href="/index.html">Volver al sitio</a>
      </header>

      {!studentDashboard && !teacher && renderLogin()}
      {studentDashboard && renderStudentPortal(studentDashboard)}
      {teacher && overview && renderTeacherPortal()}
    </main>
  );
}

