import type { StudentDashboard } from "@/app/types/academic";
import { formatScore } from "@/app/utils/academicFormat";

type PeriodChartProps = {
  data: StudentDashboard["periodAverages"];
};

export function PeriodChart({ data }: PeriodChartProps) {
  if (!data.length) return <p className="muted">Aun no hay periodos con notas.</p>;

  return (
    <div className="period-line">
      {data.map((item) => (
        <div className="period-column" key={item.periodo}>
          <div className="period-stick" style={{ height: `${Math.max(8, (item.promedio / 5) * 190)}px` }} />
          <strong>{formatScore(item.promedio)}</strong>
          <span className="muted">{item.periodo}</span>
        </div>
      ))}
    </div>
  );
}
