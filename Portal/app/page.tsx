import Link from "next/link";

export default function HomePage() {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>Portal Académico</h1>
        <p style={styles.subtitle}>John F Kennedy - Sede El Cinco</p>

        <p style={styles.description}>
          Sistema académico para estudiantes y profesores
        </p>

        <div style={styles.buttons}>
          <Link href="/portal" style={styles.buttonPrimary}>
            Acceder al Portal
          </Link>
          <a href="#" style={styles.buttonSecondary}>
            Documentación
          </a>
        </div>

        <div style={styles.info}>
          <h2>¿Qué es este portal?</h2>
          <ul>
            <li>✓ Acceso a calificaciones y notas</li>
            <li>✓ Horarios académicos</li>
            <li>✓ Gestión de estudiantes (para profesores)</li>
            <li>✓ Documentos académicos</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fa",
    padding: "1rem",
  } as React.CSSProperties,
  container: {
    maxWidth: "600px",
    textAlign: "center" as const,
    backgroundColor: "white",
    padding: "3rem 2rem",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  } as React.CSSProperties,
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "1.25rem",
    color: "#4a5568",
    marginBottom: "2rem",
  } as React.CSSProperties,
  description: {
    fontSize: "1rem",
    color: "#718096",
    marginBottom: "2rem",
  } as React.CSSProperties,
  buttons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "2rem",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  buttonPrimary: {
    padding: "0.75rem 2rem",
    backgroundColor: "#3182ce",
    color: "white",
    textDecoration: "none",
    borderRadius: "0.375rem",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  } as React.CSSProperties,
  buttonSecondary: {
    padding: "0.75rem 2rem",
    backgroundColor: "#e2e8f0",
    color: "#3182ce",
    textDecoration: "none",
    borderRadius: "0.375rem",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  } as React.CSSProperties,
  info: {
    textAlign: "left" as const,
    marginTop: "3rem",
    paddingTop: "2rem",
    borderTop: "1px solid #e2e8f0",
  } as React.CSSProperties,
};
