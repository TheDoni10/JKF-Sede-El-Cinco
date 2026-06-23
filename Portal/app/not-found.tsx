import Link from "next/link";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>404</h1>
        <h2 style={styles.heading}>Página no encontrada</h2>
        <p style={styles.message}>Lo sentimos, la página que buscas no existe o ha sido movida.</p>

        <div style={styles.links}>
          <Link href="/" style={styles.linkPrimary}>
            Ir a inicio
          </Link>
          <Link href="/student" style={styles.linkSecondary}>
            Portal de estudiantes
          </Link>
          <Link href="/teacher" style={styles.linkSecondary}>
            Portal de profesores
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  } as React.CSSProperties,
  content: {
    textAlign: "center" as const,
    padding: "2rem",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  title: {
    fontSize: "4rem",
    fontWeight: "bold",
    color: "#e53e3e",
    margin: "0 0 0.5rem 0",
  } as React.CSSProperties,
  heading: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    color: "#333",
  } as React.CSSProperties,
  message: {
    color: "#666",
    marginBottom: "2rem",
    fontSize: "1rem",
  } as React.CSSProperties,
  links: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  linkPrimary: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3182ce",
    color: "white",
    textDecoration: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "1rem",
  } as React.CSSProperties,
  linkSecondary: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#e2e8f0",
    color: "#3182ce",
    textDecoration: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "1rem",
  } as React.CSSProperties,
};
