"use client";

import { Metric } from "@/app/components/cards/Metric";
import { BarList } from "@/app/components/charts/BarList";
import type { TeacherOverview } from "@/app/types/academic";

type TeacherSummaryProps = {
  overview: TeacherOverview;
};

export function TeacherSummary({ overview }: TeacherSummaryProps) {
  return (
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
  );
}
