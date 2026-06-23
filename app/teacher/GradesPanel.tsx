"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Pencil, Save, Trash2 } from "lucide-react";
import type { GradeRecord, Student, Subject, TeacherOverview } from "@/app/types/academic";
import type { NoteForm } from "@/app/types/forms";
import { initialNoteForm } from "@/app/types/forms";
import { formatScore, fullName } from "@/app/utils/academicFormat";

type GradesPanelProps = {
  overview: TeacherOverview;
  noteForm: NoteForm;
  setNoteForm: Dispatch<SetStateAction<NoteForm>>;
  activeStudents: Student[];
  activeSubjects: Array<Subject & { gradeIds: number[] }>;
  saveNote: (event: FormEvent<HTMLFormElement>) => void;
  editNote: (note: GradeRecord) => void;
  deleteNote: (id: string) => void;
};

export function GradesPanel({
  overview,
  noteForm,
  setNoteForm,
  activeStudents,
  activeSubjects,
  saveNote,
  editNote,
  deleteNote,
}: GradesPanelProps) {
  return (
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
  );
}
