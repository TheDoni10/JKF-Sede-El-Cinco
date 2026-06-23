"use client";

import { LogOut, RefreshCcw } from "lucide-react";
import { Metric } from "@/app/components/cards/Metric";
import { BarList } from "@/app/components/charts/BarList";
import { PeriodChart } from "@/app/components/charts/PeriodChart";
import type { StudentDashboard } from "@/app/types/academic";
import { formatScore, fullName, scoreWidth } from "@/app/utils/academicFormat";

type StudentPortalProps = {
  dashboard: StudentDashboard;
  onRefresh: () => void;
  onLogout: () => void;
};

export function StudentPortal({ dashboard, onRefresh, onLogout }: StudentPortalProps) {
  return (
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
          <button className="button ghost" type="button" onClick={onRefresh}>
            <RefreshCcw size={18} /> Actualizar
          </button>
          <button className="button" type="button" onClick={onLogout}>
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
}
