export const fullName = (person: { nombre: string; apellidos: string }) =>
  `${person.nombre} ${person.apellidos}`.trim();

export const formatScore = (score: number | string | null | undefined) => Number(score || 0).toFixed(1);

export const scoreWidth = (score: number) => `${Math.max(3, Math.min(100, (score / 5) * 100))}%`;
