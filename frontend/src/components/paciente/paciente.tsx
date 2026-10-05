import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Paciente() {
  // ============================================================
  // TICKET 01 - ESTADOS DO FORMULÁRIO
  // ============================================================

  const [nomeAnimal, setNomeAnimal] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [sexo, setSexo] = useState("");
  const [idade, setIdade] = useState("");
  const [nomeTutor, setNomeTutor] = useState("");
  const [telefoneTutor, setTelefoneTutor] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const navigate = useNavigate();

  // ============================================================
  // TICKET 02 - CADASTRAR PACIENTE
  // ============================================================

  async function cadastrarPaciente(evento: React.FormEvent) {
    evento.preventDefault();

    // Limpa mensagens anteriores
    setMensagem("");
    setErro("");

    // ============================================================
    // TICKET 03 - VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
    // ============================================================

    if (!nomeAnimal.trim()) {
      setErro("Informe o nome do animal.");
      return;
    }

    if (!especie.trim()) {
      setErro("Informe a espécie do animal.");
      return;
    }

    if (!nomeTutor.trim()) {
      setErro("Informe o nome do tutor.");
      return;
    }

    // ============================================================
    // TICKET 04 - VERIFICAÇÃO DO TOKEN
    // ============================================================

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    setSalvando(true);

    try {
      // ==========================================================
      // TICKET 05 - ENVIO PARA O BACKEND
      // ==========================================================

      const resposta = await fetch("http://localhost:3333/pacientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome_animal: nomeAnimal.trim(),
          especie: especie.trim(),
          raca: raca.trim(),
          sexo: sexo,
          idade: idade.trim(),
          nome_tutor: nomeTutor.trim(),
          telefone_tutor: telefoneTutor.trim(),
        }),
      });

      const dados = await resposta.json();

      // ==========================================================
      // TICKET 06 - TOKEN EXPIRADO / INVÁLIDO
      // ==========================================================

      if (resposta.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("veterinario");
        navigate("/");
        return;
      }

      // ==========================================================
      // TICKET 07 - TRATAMENTO DE ERRO
      // ==========================================================

      if (!resposta.ok) {
        setErro(
          dados.mensagem ||
          "Não foi possível cadastrar o paciente."
        );
        return;
      }

      // ==========================================================
      // TICKET 08 - SUCESSO
      // ==========================================================

      setMensagem("Paciente cadastrado com sucesso!");

      // Limpa o formulário
      setNomeAnimal("");
      setEspecie("");
      setRaca("");
      setSexo("");
      setIdade("");
      setNomeTutor("");
      setTelefoneTutor("");

      // ==========================================================
      // TICKET 09 - REDIRECIONAMENTO PARA MEUS PACIENTES
      // ==========================================================

      setTimeout(() => {
        navigate("/listapaciente");
      }, 800);

    } catch (erro) {
      console.error("Erro ao conectar com o servidor:", erro);

      setErro(
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  // ============================================================
  // TICKET 10 - INTERFACE
  // ============================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f7fb",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "35px",
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* ======================================================
            TICKET 11 - TÍTULO
        ====================================================== */}

        <h2
          style={{
            color: "#4a4b4d",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          Novo Paciente
        </h2>

        <p
          style={{
            color: "#777",
            marginBottom: "30px",
          }}
        >
          Cadastre os dados do paciente e do tutor.
        </p>

        {/* ======================================================
            TICKET 12 - MENSAGEM DE SUCESSO
        ====================================================== */}

        {mensagem && (
          <div
            style={{
              backgroundColor: "#e8f7ee",
              color: "#247a45",
              padding: "12px 15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {mensagem}
          </div>
        )}

        {/* ======================================================
            TICKET 13 - MENSAGEM DE ERRO
        ====================================================== */}

        {erro && (
          <div
            style={{
              backgroundColor: "#fdecec",
              color: "#b42318",
              padding: "12px 15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {erro}
          </div>
        )}

        {/* ======================================================
            TICKET 14 - FORMULÁRIO
        ====================================================== */}

        <form onSubmit={cadastrarPaciente}>

          {/* Nome do animal */}

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#4a4b4d",
                fontWeight: 500,
              }}
            >
              Nome do animal *
            </label>

            <input
              type="text"
              value={nomeAnimal}
              onChange={(evento) => setNomeAnimal(evento.target.value)}
              maxLength={100}
              placeholder="Ex.: Thor"
              style={estiloInput}
            />
          </div>

          {/* Espécie */}

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#4a4b4d",
                fontWeight: 500,
              }}
            >
              Espécie *
            </label>

            <input
              type="text"
              value={especie}
              onChange={(evento) => setEspecie(evento.target.value)}
              maxLength={50}
              placeholder="Ex.: Cachorro"
              style={estiloInput}
            />
          </div>

          {/* Raça */}

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#4a4b4d",
                fontWeight: 500,
              }}
            >
              Raça
            </label>

            <input
              type="text"
              value={raca}
              onChange={(evento) => setRaca(evento.target.value)}
              maxLength={50}
              placeholder="Ex.: Golden Retriever"
              style={estiloInput}
            />
          </div>

          {/* Sexo */}

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#4a4b4d",
                fontWeight: 500,
              }}
            >
              Sexo
            </label>

            <select
              value={sexo}
              onChange={(evento) => setSexo(evento.target.value)}
              style={estiloInput}
            >
              <option value="">Selecione</option>
              <option value="Macho">Macho</option>
              <option value="Fêmea">Fêmea</option>
            </select>
          </div>

          {/* Idade */}

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#4a4b4d",
                fontWeight: 500,
              }}
            >
              Idade
            </label>

            <input
              type="text"
              value={idade}
              onChange={(evento) => setIdade(evento.target.value)}
              maxLength={30}
              placeholder="Ex.: 5 anos"
              style={estiloInput}
            />
          </div>

          {/* Nome do tutor */}

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#4a4b4d",
                fontWeight: 500,
              }}
            >
              Nome do tutor *
            </label>

            <input
              type="text"
              value={nomeTutor}
              onChange={(evento) => setNomeTutor(evento.target.value)}
              maxLength={100}
              placeholder="Ex.: João da Silva"
              style={estiloInput}
            />
          </div>

          {/* Telefone */}

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#4a4b4d",
                fontWeight: 500,
              }}
            >
              Telefone do tutor
            </label>

            <input
              type="text"
              value={telefoneTutor}
              onChange={(evento) =>
                setTelefoneTutor(evento.target.value)
              }
              maxLength={20}
              placeholder="Ex.: (18) 99999-9999"
              style={estiloInput}
            />
          </div>

          {/* ==================================================
              TICKET 15 - BOTÃO
          ================================================== */}

          <button
            type="submit"
            disabled={salvando}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: salvando ? "#777" : "#4a4b4d",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 500,
              cursor: salvando ? "not-allowed" : "pointer",
            }}
          >
            {salvando ? "Cadastrando..." : "Cadastrar paciente"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// TICKET 16 - ESTILO DOS CAMPOS
// ============================================================

const estiloInput: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #d9dde3",
  borderRadius: "8px",
  fontSize: "15px",
  color: "#4a4b4d",
  backgroundColor: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
};

export default Paciente;