"use client";

import { LoginPanel } from "@/app/components/forms/LoginPanel";
import { PortalTopbar } from "@/app/components/navbar/PortalTopbar";
import { useAcademicPortal } from "@/app/hooks/useAcademicPortal";
import { StudentPortal } from "@/app/student/StudentPortal";
import { TeacherPortal } from "@/app/teacher/TeacherPortal";

export default function AcademicPortal() {
  const portal = useAcademicPortal();

  return (
    <main className="academic-shell">
      <PortalTopbar />

      {!portal.studentDashboard && !portal.teacher && (
        <LoginPanel
          mode={portal.mode}
          setMode={portal.setMode}
          studentDocument={portal.studentDocument}
          setStudentDocument={portal.setStudentDocument}
          teacherDocument={portal.teacherDocument}
          setTeacherDocument={portal.setTeacherDocument}
          loginStudent={portal.loginStudent}
          loginTeacher={portal.loginTeacher}
          loading={portal.loading}
          status={portal.status}
        />
      )}

      {portal.studentDashboard && (
        <StudentPortal
          dashboard={portal.studentDashboard}
          onRefresh={() => portal.refreshStudent()}
          onLogout={portal.logout}
        />
      )}

      {portal.teacher && portal.overview && (
        <TeacherPortal
          teacher={portal.teacher}
          overview={portal.overview}
          teacherTab={portal.teacherTab}
          setTeacherTab={portal.setTeacherTab}
          studentForm={portal.studentForm}
          setStudentForm={portal.setStudentForm}
          teacherForm={portal.teacherForm}
          setTeacherForm={portal.setTeacherForm}
          subjectForm={portal.subjectForm}
          setSubjectForm={portal.setSubjectForm}
          noteForm={portal.noteForm}
          setNoteForm={portal.setNoteForm}
          search={portal.search}
          setSearch={portal.setSearch}
          status={portal.status}
          filteredStudents={portal.filteredStudents}
          activeStudents={portal.activeStudents}
          activeSubjects={portal.activeSubjects}
          refreshTeacher={portal.refreshTeacher}
          logout={portal.logout}
          saveStudent={portal.saveStudent}
          editStudent={portal.editStudent}
          deleteStudent={portal.deleteStudent}
          saveTeacher={portal.saveTeacher}
          editTeacher={portal.editTeacher}
          deleteTeacher={portal.deleteTeacher}
          saveSubject={portal.saveSubject}
          editSubject={portal.editSubject}
          deleteSubject={portal.deleteSubject}
          saveNote={portal.saveNote}
          editNote={portal.editNote}
          deleteNote={portal.deleteNote}
          toggleSubjectGrade={portal.toggleSubjectGrade}
        />
      )}
    </main>
  );
}
