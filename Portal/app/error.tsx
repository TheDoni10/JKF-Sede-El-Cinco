"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error a servicio de monitoreo (ej: Sentry)
    console.error("Error capturado:", error);
  }, [error]);

  return (
    <div className="error-container" style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>Algo salió mal</h2>
        <p style={styles.message}>{error.message || "Ocurrió un error inesperado"}</p>
        {error.digest && <p style={styles.digest}>ID del error: {error.digest}</p>}

        <button onClick={() => reset()} style={styles.button}>
          Intentar de nuevo
        </button>
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
    maxWidth: "500px",
  } as React.CSSProperties,
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#e53e3e",
  } as React.CSSProperties,
  message: {
    color: "#666",
    marginBottom: "1rem",
  } as React.CSSProperties,
  digest: {
    fontSize: "0.875rem",
    color: "#999",
    marginBottom: "1.5rem",
  } as React.CSSProperties,
  button: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3182ce",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "1rem",
  } as React.CSSProperties,
};
