"use client";

import type { TeacherOverview } from "@/app/types/academic";
import { formatScore, fullName } from "@/app/utils/academicFormat";

type RankingPanelProps = {
  overview: TeacherOverview;
};

export function RankingPanel({ overview }: RankingPanelProps) {
  return (
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
  );
}
