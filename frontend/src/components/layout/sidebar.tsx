import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const navegar = useNavigate();
  const localizacao = useLocation();

  return (
    <aside style={styles.sidebar}>

      <div style={styles.content}>

        <div style={styles.logo}>
          S.O.V
        </div>

        <div style={styles.systemName}>
          Serviço de Oftalmologia
          <br />
          Veterinária
        </div>

        <nav style={styles.menu}>

          <button
            style={
              localizacao.pathname === "/dashboard"
                ? styles.menuItemActive
                : styles.menuItem
            }
            onClick={() => navegar("/dashboard")}
          >
            Dashboard
          </button>

          <button
            style={
              localizacao.pathname === "/listapaciente"
                ? styles.menuItemActive
                : styles.menuItem
            }
            onClick={() => navegar("/listapaciente")}
          >
            Pacientes
          </button>

{/* =====================================================
    TICKET: MENU DE CONSULTAS
    Abre a tela com a lista de consultas
===================================================== */}

          <button
            style={
              localizacao.pathname === "/consultas"
                ? styles.menuItemActive
                : styles.menuItem
            }
            onClick={() => navegar("/consultas")}
          >
            Consultas
          </button>

        </nav>

      </div>

      <button
        style={styles.logoutButton}
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("veterinario");
          window.location.href = "/";
        }}
      >
        Sair
      </button>

    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {

  sidebar: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "240px",
    height: "100vh",
    backgroundColor: "#4a4b4d",
    padding: "28px 20px",
    boxSizing: "border-box",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  content: {
    width: "100%",
  },

  logo: {
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "8px",
  },

  systemName: {
    color: "#d1d5db",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "35px",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  menuItem: {
    width: "100%",
    padding: "15px 16px",
    backgroundColor: "transparent",
    color: "#d1d5db",
    border: "none",
    borderRadius: "9px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
  },

  menuItemActive: {
    width: "100%",
    padding: "15px 16px",
    backgroundColor: "#ffffff",
    color: "#4a4b4d",
    border: "none",
    borderRadius: "9px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },

  logoutButton: {
    width: "100%",
    padding: "15px 16px",
    backgroundColor: "transparent",
    color: "#d1d5db",
    border: "none",
    borderRadius: "9px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
  },

};

export default Sidebar;