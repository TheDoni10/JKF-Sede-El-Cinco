"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { LogOut, RefreshCcw } from "lucide-react";
import { TEACHER_TABS } from "@/app/constants/teacherTabs";
import type { GradeRecord, Student, Subject, Teacher, TeacherOverview } from "@/app/types/academic";
import type { NoteForm, StudentForm, SubjectForm, TeacherForm, TeacherTab } from "@/app/types/forms";
import { fullName } from "@/app/utils/academicFormat";
import { GradesPanel } from "./GradesPanel";
import { RankingPanel } from "./RankingPanel";
import { StudentsPanel } from "./StudentsPanel";
import { SubjectsPanel } from "./SubjectsPanel";
import { TeachersPanel } from "./TeachersPanel";
import { TeacherSummary } from "./TeacherSummary";

type TeacherPortalProps = {
  teacher: Teacher;
  overview: TeacherOverview;
  teacherTab: TeacherTab;
  setTeacherTab: Dispatch<SetStateAction<TeacherTab>>;
  studentForm: StudentForm;
  setStudentForm: Dispatch<SetStateAction<StudentForm>>;
  teacherForm: TeacherForm;
  setTeacherForm: Dispatch<SetStateAction<TeacherForm>>;
  subjectForm: SubjectForm;
  setSubjectForm: Dispatch<SetStateAction<SubjectForm>>;
  noteForm: NoteForm;
  setNoteForm: Dispatch<SetStateAction<NoteForm>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  status: string;
  filteredStudents: Student[];
  activeStudents: Student[];
  activeSubjects: Array<Subject & { gradeIds: number[] }>;
  refreshTeacher: () => void;
  logout: () => void;
  saveStudent: (event: FormEvent<HTMLFormElement>) => void;
  editStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  saveTeacher: (event: FormEvent<HTMLFormElement>) => void;
  editTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  saveSubject: (event: FormEvent<HTMLFormElement>) => void;
  editSubject: (subject: Subject & { gradeIds: number[] }) => void;
  deleteSubject: (id: string) => void;
  saveNote: (event: FormEvent<HTMLFormElement>) => void;
  editNote: (note: GradeRecord) => void;
  deleteNote: (id: string) => void;
  toggleSubjectGrade: (gradeId: number) => void;
};

export function TeacherPortal({
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
  filteredStudents,
  activeStudents,
  activeSubjects,
  refreshTeacher,
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
}: TeacherPortalProps) {
  return (
    <>
      <div className="portal-header">
        <div>
          <p className="eyebrow">Portal de profesores</p>
          <h1>{fullName(teacher)}</h1>
          <p className="muted">Administracion academica completa - Cedula {teacher.numero_documento}</p>
        </div>
        <div className="actions">
          <button className="button ghost" type="button" onClick={refreshTeacher}>
            <RefreshCcw size={18} /> Actualizar
          </button>
          <button className="button" type="button" onClick={logout}>
            <LogOut size={18} /> Salir
          </button>
        </div>
      </div>

      <div className="tabs">
        {TEACHER_TABS.map(([key, label, Icon]) => (
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

      {teacherTab === "resumen" && <TeacherSummary overview={overview} />}
      {teacherTab === "estudiantes" && (
        <StudentsPanel
          overview={overview}
          studentForm={studentForm}
          setStudentForm={setStudentForm}
          search={search}
          setSearch={setSearch}
          filteredStudents={filteredStudents}
          saveStudent={saveStudent}
          editStudent={editStudent}
          deleteStudent={deleteStudent}
        />
      )}
      {teacherTab === "profesores" && (
        <TeachersPanel
          overview={overview}
          teacherForm={teacherForm}
          setTeacherForm={setTeacherForm}
          saveTeacher={saveTeacher}
          editTeacher={editTeacher}
          deleteTeacher={deleteTeacher}
        />
      )}
      {teacherTab === "materias" && (
        <SubjectsPanel
          overview={overview}
          subjectForm={subjectForm}
          setSubjectForm={setSubjectForm}
          saveSubject={saveSubject}
          editSubject={editSubject}
          deleteSubject={deleteSubject}
          toggleSubjectGrade={toggleSubjectGrade}
        />
      )}
      {teacherTab === "notas" && (
        <GradesPanel
          overview={overview}
          noteForm={noteForm}
          setNoteForm={setNoteForm}
          activeStudents={activeStudents}
          activeSubjects={activeSubjects}
          saveNote={saveNote}
          editNote={editNote}
          deleteNote={deleteNote}
        />
      )}
      {teacherTab === "ranking" && <RankingPanel overview={overview} />}
      <p className="status">{status}</p>
    </>
  );
}
