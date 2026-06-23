"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Pencil, Save, Trash2 } from "lucide-react";
import type { Subject, TeacherOverview } from "@/app/types/academic";
import type { SubjectForm } from "@/app/types/forms";
import { initialSubjectForm } from "@/app/types/forms";

type SubjectsPanelProps = {
  overview: TeacherOverview;
  subjectForm: SubjectForm;
  setSubjectForm: Dispatch<SetStateAction<SubjectForm>>;
  saveSubject: (event: FormEvent<HTMLFormElement>) => void;
  editSubject: (subject: Subject & { gradeIds: number[] }) => void;
  deleteSubject: (id: string) => void;
  toggleSubjectGrade: (gradeId: number) => void;
};

export function SubjectsPanel({
  overview,
  subjectForm,
  setSubjectForm,
  saveSubject,
  editSubject,
  deleteSubject,
  toggleSubjectGrade,
}: SubjectsPanelProps) {
  return (
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
  );
}
