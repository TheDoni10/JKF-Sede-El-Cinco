"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Pencil, Save, Trash2 } from "lucide-react";
import type { Teacher, TeacherOverview } from "@/app/types/academic";
import type { TeacherForm } from "@/app/types/forms";
import { initialTeacherForm } from "@/app/types/forms";
import { fullName } from "@/app/utils/academicFormat";

type TeachersPanelProps = {
  overview: TeacherOverview;
  teacherForm: TeacherForm;
  setTeacherForm: Dispatch<SetStateAction<TeacherForm>>;
  saveTeacher: (event: FormEvent<HTMLFormElement>) => void;
  editTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
};

export function TeachersPanel({
  overview,
  teacherForm,
  setTeacherForm,
  saveTeacher,
  editTeacher,
  deleteTeacher,
}: TeachersPanelProps) {
  return (
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
  );
}
