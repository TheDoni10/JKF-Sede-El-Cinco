"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { GraduationCap, Search, Users } from "lucide-react";
import type { LoginMode } from "@/app/types/forms";

type LoginPanelProps = {
  mode: LoginMode;
  setMode: Dispatch<SetStateAction<LoginMode>>;
  studentDocument: string;
  setStudentDocument: Dispatch<SetStateAction<string>>;
  teacherDocument: string;
  setTeacherDocument: Dispatch<SetStateAction<string>>;
  loginStudent: (event: FormEvent<HTMLFormElement>) => void;
  loginTeacher: (event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  status: string;
};

export function LoginPanel({
  mode,
  setMode,
  studentDocument,
  setStudentDocument,
  teacherDocument,
  setTeacherDocument,
  loginStudent,
  loginTeacher,
  loading,
  status,
}: LoginPanelProps) {
  return (
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
}
