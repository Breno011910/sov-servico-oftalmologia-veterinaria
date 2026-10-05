import React from "react";

function Header() {

  // ============================================================
  // TICKET 01 - DADOS DO VETERINÁRIO
  // ============================================================

  const veterinario = localStorage.getItem("veterinario");

  let dadosVeterinario = null;

  try {

    dadosVeterinario = veterinario
      ? JSON.parse(veterinario)
      : null;

  } catch (erro) {

    console.error(
      "Erro ao ler dados do veterinário:",
      erro
    );

  }


  // ============================================================
  // TICKET 02 - NOME DO VETERINÁRIO
  // ============================================================

  const nome =
    dadosVeterinario?.nome ||
    dadosVeterinario?.nome_completo ||
    "Breno";

  const primeiroNome =
    String(nome)
      .trim()
      .split(" ")[0];


  // ============================================================
  // TICKET 03 - RENDERIZAÇÃO
  // ============================================================

  return (

    <header style={styles.header}>

      <div style={styles.userArea}>

        <div style={styles.avatar}>
          {primeiroNome.charAt(0).toUpperCase()}
        </div>

        <div style={styles.userInfo}>

          <div style={styles.userName}>
            {dadosVeterinario?.tratamento || "Dr."} {primeiroNome}
          </div>

          <div style={styles.userRole}>
            {dadosVeterinario?.tratamento === "Dra."
              ? "Veterinária"
              : "Veterinário"}
          </div>

        </div>

      </div>

    </header>
  );
}


// ============================================================
// TICKET 04 - ESTILOS
// ============================================================

const styles: Record<string, React.CSSProperties> = {

  header: {
    position: "fixed",
    top: "0",
    left: "240px",
    right: "0",
    height: "72px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 32px",
    boxSizing: "border-box",
    zIndex: 999,
  },

  userArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#4a4b4d",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
  },

  userInfo: {
    minWidth: "0",
  },

  userName: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: "600",
  },

  userRole: {
    marginTop: "2px",
    color: "#6b7280",
    fontSize: "12px",
  },

};

export default Header;