import { formatScore, scoreWidth } from "@/app/utils/academicFormat";

type BarListProps = {
  data: Array<Record<string, string | number>>;
  labelKey: string;
};

export function BarList({ data, labelKey }: BarListProps) {
  if (!data.length) return <p className="muted">Aun no hay datos para graficar.</p>;

  return (
    <div className="bar-list">
      {data.map((item) => {
        const label = String(item[labelKey]);
        const value = Number(item.promedio || 0);

        return (
          <div className="bar-row" key={label}>
            <strong>{label}</strong>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: scoreWidth(value) }} />
            </div>
            <span>{formatScore(value)}</span>
          </div>
        );
      })}
    </div>
  );
}
