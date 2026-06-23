"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Pencil, Save, Search, Trash2 } from "lucide-react";
import type { Student, TeacherOverview } from "@/app/types/academic";
import type { StudentForm } from "@/app/types/forms";
import { initialStudentForm } from "@/app/types/forms";
import { fullName } from "@/app/utils/academicFormat";

type StudentsPanelProps = {
  overview: TeacherOverview;
  studentForm: StudentForm;
  setStudentForm: Dispatch<SetStateAction<StudentForm>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  filteredStudents: Student[];
  saveStudent: (event: FormEvent<HTMLFormElement>) => void;
  editStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
};

export function StudentsPanel({
  overview,
  studentForm,
  setStudentForm,
  search,
  setSearch,
  filteredStudents,
  saveStudent,
  editStudent,
  deleteStudent,
}: StudentsPanelProps) {
  return (
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
  );
}
