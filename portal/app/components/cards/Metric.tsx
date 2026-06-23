type MetricProps = {
  label: string;
  value: string | number;
  tone?: "success" | "warning" | "danger";
};

export function Metric({ label, value, tone }: MetricProps) {
  return (
    <article className={`metric ${tone ? `tone-${tone}` : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
