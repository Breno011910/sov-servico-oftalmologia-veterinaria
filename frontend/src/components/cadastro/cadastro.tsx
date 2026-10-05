import React, { useState } from "react";
import { Link } from "react-router-dom";

function Cadastro() {
  const [nome, setNome] = useState("");
  const [tratamento, setTratamento] = useState("Dr.");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  // ============================================================
  // VALIDAÇÃO DOS REQUISITOS DA SENHA
  // ============================================================

  const senhaRequisitos = {
    tamanho: senha.length >= 8,
    minuscula: /[a-z]/.test(senha),
    maiuscula: /[A-Z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[\W_]/.test(senha),
  };

  const senhaValida =
    senhaRequisitos.tamanho &&
    senhaRequisitos.minuscula &&
    senhaRequisitos.maiuscula &&
    senhaRequisitos.numero &&
    senhaRequisitos.especial;

  // ============================================================
  // CADASTRO
  // ============================================================

  async function cadastrar() {
    setErro("");
    setSucesso("");

    if (!nome.trim()) {
      setErro("Digite seu nome.");
      return;
    }

    if (tratamento !== "Dr." && tratamento !== "Dra.") {
      setErro("Selecione o tratamento.");
      return;
    }

    if (!email.trim()) {
      setErro("Digite seu e-mail.");
      return;
    }

    if (!email.includes("@")) {
      setErro("Digite um e-mail válido.");
      return;
    }

    if (!senha) {
      setErro("Digite uma senha.");
      return;
    }

    if (!senhaValida) {
      setErro("A senha não atende a todos os requisitos.");
      return;
    }

    if (!confirmarSenha) {
      setErro("Confirme sua senha.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("http://localhost:3333/registro", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          nome,
          tratamento,
          email,
          senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || dados.mensagem || "Não foi possível criar a conta.");
        return;
      }

      setSucesso("Conta criada com sucesso!");

      console.log("Usuário criado:", dados);

      setNome("");
      setTratamento("Dr.");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");

    } catch (erro) {
      console.error("Erro ao cadastrar:", erro);

      setErro(
        "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
      );
    } finally {
      setCarregando(false);
    }
  }

  // ============================================================
  // ENTER PARA ENVIAR O CADASTRO
  // ============================================================

  function enviarFormulario(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    cadastrar();
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          S.O.V
        </div>

        <h1 style={styles.title}>
          Criar sua conta
        </h1>

        <p style={styles.description}>
          Serviço de Oftalmologia Veterinária
        </p>

        <p style={styles.subtitle}>
          Preencha os dados para criar sua conta
        </p>

        {/* ============================================================
            FORMULÁRIO
        ============================================================ */}

        <form
          style={styles.form}
          onSubmit={enviarFormulario}
        >

          {/* ============================================================
              NOME
          ============================================================ */}

          <div>
            <label style={styles.label}>
              Nome
            </label>

            <input
              type="text"
              placeholder="Digite seu nome"
              style={styles.input}
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
            />
          </div>

          {/* ============================================================
              TRATAMENTO
          ============================================================ */}

          <div>
            <label style={styles.label}>
              Tratamento
            </label>

            <select
              value={tratamento}
              onChange={(evento) => setTratamento(evento.target.value)}
              style={styles.input}
            >
              <option value="Dr.">
                Dr.
              </option>

              <option value="Dra.">
                Dra.
              </option>
            </select>
          </div>

          {/* ============================================================
              E-MAIL
          ============================================================ */}

          <div>
            <label style={styles.label}>
              E-mail
            </label>

            <input
              type="email"
              placeholder="seu@email.com"
              style={styles.input}
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
            />
          </div>

          {/* ============================================================
              SENHA
          ============================================================ */}

          <div>
            <label style={styles.label}>
              Senha
            </label>

            <div style={styles.passwordContainer}>
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Crie uma senha"
                style={styles.passwordInput}
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
              />

              <button
                type="button"
                style={styles.passwordButton}
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {/* ============================================================
                REQUISITOS DA SENHA
            ============================================================ */}

            <div style={styles.passwordRequirements}>

              <div
                style={{
                  ...styles.requirement,
                  color: senhaRequisitos.tamanho
                    ? "#15803d"
                    : "#6b7280",
                }}
              >
                {senhaRequisitos.tamanho ? "✓" : "○"} Pelo menos 8 caracteres
              </div>

              <div
                style={{
                  ...styles.requirement,
                  color: senhaRequisitos.minuscula
                    ? "#15803d"
                    : "#6b7280",
                }}
              >
                {senhaRequisitos.minuscula ? "✓" : "○"} Uma letra minúscula
              </div>

              <div
                style={{
                  ...styles.requirement,
                  color: senhaRequisitos.maiuscula
                    ? "#15803d"
                    : "#6b7280",
                }}
              >
                {senhaRequisitos.maiuscula ? "✓" : "○"} Uma letra maiúscula
              </div>

              <div
                style={{
                  ...styles.requirement,
                  color: senhaRequisitos.numero
                    ? "#15803d"
                    : "#6b7280",
                }}
              >
                {senhaRequisitos.numero ? "✓" : "○"} Um número
              </div>

              <div
                style={{
                  ...styles.requirement,
                  color: senhaRequisitos.especial
                    ? "#15803d"
                    : "#6b7280",
                }}
              >
                {senhaRequisitos.especial ? "✓" : "○"} Um caractere especial
              </div>

            </div>
          </div>

          {/* ============================================================
              CONFIRMAR SENHA
          ============================================================ */}

          <div>
            <label style={styles.label}>
              Confirmar senha
            </label>

            <div style={styles.passwordContainer}>
              <input
                type={mostrarConfirmarSenha ? "text" : "password"}
                placeholder="Digite a senha novamente"
                style={styles.passwordInput}
                value={confirmarSenha}
                onChange={(evento) =>
                  setConfirmarSenha(evento.target.value)
                }
              />

              <button
                type="button"
                style={styles.passwordButton}
                onClick={() =>
                  setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                }
              >
                {mostrarConfirmarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {/* ============================================================
              MENSAGENS
          ============================================================ */}

          {erro && (
            <div style={styles.error}>
              {erro}
            </div>
          )}

          {sucesso && (
            <div style={styles.success}>
              {sucesso}
            </div>
          )}

          {/* ============================================================
              BOTÃO CADASTRAR
          ============================================================ */}

          <button
            type="submit"
            style={styles.button}
            disabled={carregando}
          >
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>

          {/* ============================================================
              LINK PARA LOGIN
          ============================================================ */}

          <div style={styles.loginContainer}>
            <span style={styles.loginText}>
              Já possui uma conta?
            </span>

            <Link to="/" style={styles.loginLink}>
              Entrar
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7fb",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  },

  logo: {
    width: "64px",
    height: "64px",
    margin: "0 auto 24px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a4b4d",
    color: "#ffffff",
    borderRadius: "14px",
    fontSize: "18px",
    fontWeight: "700",
  },

  title: {
    margin: "0",
    textAlign: "center",
    fontSize: "28px",
    color: "#111827",
  },

  description: {
    marginTop: "8px",
    marginBottom: "6px",
    textAlign: "center",
    color: "#4a4a4b",
    fontSize: "14px",
    fontWeight: "600",
  },

  subtitle: {
    marginTop: "0",
    marginBottom: "30px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "15px",
    outline: "none",
  },

  // ============================================================
  // CAMPOS DE SENHA
  // ============================================================

  passwordContainer: {
    display: "flex",
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  passwordInput: {
    flex: 1,
    minWidth: 0,
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "none",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "15px",
    outline: "none",
  },

  passwordButton: {
    border: "none",
    backgroundColor: "#ffffff",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "600",
    padding: "0 12px",
    cursor: "pointer",
  },

  // ============================================================
  // REQUISITOS DA SENHA
  // ============================================================

  passwordRequirements: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  requirement: {
    fontSize: "12px",
  },

  // ============================================================
  // BOTÃO
  // ============================================================

  button: {
    border: "none",
    borderRadius: "9px",
    padding: "13px",
    backgroundColor: "#4a4b4d",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  // ============================================================
  // MENSAGENS
  // ============================================================

  error: {
    padding: "10px 12px",
    borderRadius: "8px",
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    fontSize: "14px",
  },

  success: {
    padding: "10px 12px",
    borderRadius: "8px",
    backgroundColor: "#f0fdf4",
    color: "#15803d",
    fontSize: "14px",
  },

  // ============================================================
  // LOGIN
  // ============================================================

  loginContainer: {
    textAlign: "center",
    marginTop: "4px",
  },

  loginText: {
    color: "#6b7280",
    fontSize: "14px",
    marginRight: "5px",
  },

  loginLink: {
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Cadastro;