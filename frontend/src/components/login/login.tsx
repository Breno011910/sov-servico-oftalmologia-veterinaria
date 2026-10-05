import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requisicao } from "../../services/api";

function Login() {

  // ============================================================
  // TICKET 01 - ESTADOS
  // ============================================================

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate();


  // ============================================================
  // TICKET 02 - ENVIO DO LOGIN
  // ============================================================

  const enviarFormulario = async (
    evento: React.FormEvent<HTMLFormElement>
  ) => {

    evento.preventDefault();
    setMensagem("");

    try {

      const dados = await requisicao("/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          senha,
        }),
      });


      // ========================================================
      // TICKET 03 - SALVAR TOKEN
      // ========================================================

      localStorage.setItem("token", dados.token);


      // ========================================================
      // TICKET 04 - SALVAR DADOS DO VETERINÁRIO
      // ========================================================

      localStorage.setItem(
        "veterinario",
        JSON.stringify({
          id: dados.veterinario.id,
          nome: dados.veterinario.nome,
          tratamento: dados.veterinario.tratamento,
          email: dados.veterinario.email,
        })
      );


      // ========================================================
      // TICKET 05 - IR PARA O DASHBOARD
      // ========================================================

      navigate("/dashboard");

    } catch (erro: any) {

      console.error("Erro no login:", erro);

      setMensagem(
        erro?.message ||
        "E-mail ou senha inválidos."
      );
    }
  };


  // ============================================================
  // TICKET 06 - RENDERIZAÇÃO
  // ============================================================

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        {/* ======================================================
            LOGO
        ====================================================== */}

        <div style={styles.logo}>
          S.O.V
        </div>


        {/* ======================================================
            TÍTULO
        ====================================================== */}

        <h1 style={styles.titulo}>
          Bem-vindo ao S.O.V
        </h1>

        <p style={styles.subtitulo}>
          Serviço de Oftalmologia Veterinária
        </p>


        {/* ======================================================
            FORMULÁRIO
        ====================================================== */}

        <form onSubmit={enviarFormulario}>

          {/* ====================================================
              E-MAIL
          ==================================================== */}

          <div style={styles.grupo}>

            <label style={styles.label}>
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
              style={styles.input}
            />

          </div>


          {/* ====================================================
              SENHA
          ==================================================== */}

          <div style={styles.grupo}>

            <label style={styles.label}>
              Senha
            </label>

            <div style={styles.senhaContainer}>

              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                style={styles.inputSenha}
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={styles.botaoSenha}
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>

            </div>

          </div>


          {/* ====================================================
              MENSAGEM
          ==================================================== */}

          {mensagem && (
            <div style={styles.mensagem}>
              {mensagem}
            </div>
          )}


          {/* ====================================================
              BOTÃO ENTRAR
          ==================================================== */}

          <button
            type="submit"
            style={styles.botao}
          >
            Entrar
          </button>

        </form>


        {/* ======================================================
            CADASTRO
        ====================================================== */}

        <div style={styles.cadastroArea}>

          <span style={styles.cadastroTexto}>
            Ainda não possui uma conta?
          </span>

          <button
            type="button"
            onClick={() => navigate("/cadastro")}
            style={styles.linkCadastro}
          >
            Cadastre-se
          </button>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// TICKET 07 - ESTILOS
// ============================================================

const styles: Record<string, React.CSSProperties> = {

  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
    boxSizing: "border-box",
  },

  logo: {
    textAlign: "center",
    color: "#4a4b4d",
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "16px",
  },

  titulo: {
    textAlign: "center",
    color: "#4a4b4d",
    fontSize: "24px",
    margin: "0 0 8px 0",
  },

  subtitulo: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    margin: "0 0 30px 0",
  },

  grupo: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    color: "#4a4b4d",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },

  senhaContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputSenha: {
    width: "100%",
    padding: "12px 80px 12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },

  botaoSenha: {
    position: "absolute",
    right: "10px",
    border: "none",
    backgroundColor: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  mensagem: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    marginBottom: "16px",
  },

  botao: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#4a4b4d",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  cadastroArea: {
    textAlign: "center",
    marginTop: "24px",
  },

  cadastroTexto: {
    color: "#6b7280",
    fontSize: "13px",
    marginRight: "5px",
  },

  linkCadastro: {
    border: "none",
    backgroundColor: "transparent",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
  },

};

export default Login;