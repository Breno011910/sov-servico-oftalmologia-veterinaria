// ============================================
// SOV - DETALHE DO PACIENTE
// Exibe os dados do paciente e seu histórico
// de consultas
// ============================================

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ============================================
// INTERFACE DO PACIENTE
// ============================================

interface Paciente {
  id: number;
  nome_animal: string;
  especie: string;
  raca?: string;
  sexo?: string;
  idade?: string;
  nome_tutor: string;
  telefone_tutor?: string;
}

// ============================================
// INTERFACE DA CONSULTA
// ============================================

interface Consulta {
  id: number;
  paciente_id: number;
  data_consulta: string;
  motivo: string;
  diagnostico: string;
  observacoes: string;
}

// ============================================
// COMPONENTE
// ============================================

function DetalhePaciente() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [paciente, setPaciente] = useState<Paciente | null>(null);

  const [consultas, setConsultas] = useState<Consulta[]>([]);

  const [carregando, setCarregando] = useState(true);

  const [carregandoConsultas, setCarregandoConsultas] =
    useState(true);

  // ============================================
  // BUSCAR PACIENTE
  // ============================================

  useEffect(() => {
    async function carregarPaciente() {
      const token = localStorage.getItem("token");

      if (!token || !id) {
        setCarregando(false);
        return;
      }

      try {
        const resposta = await fetch(
          `http://localhost:3333/pacientes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const dados = await resposta.json();

        // ============================================
        // TOKEN EXPIRADO / INVÁLIDO
        // ============================================

        if (resposta.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("veterinario");

          navegar("/");
          return;
        }

        // ============================================
        // ERRO AO BUSCAR PACIENTE
        // ============================================

        if (!resposta.ok) {
          console.error(
            "Erro ao buscar paciente:",
            dados.mensagem
          );

          return;
        }

        setPaciente(dados);

      } catch (erro) {
        console.error(
          "Erro ao buscar paciente:",
          erro
        );

      } finally {
        setCarregando(false);
      }
    }

    carregarPaciente();

  }, [id, navegar]);


  // ============================================
  // BUSCAR HISTÓRICO DE CONSULTAS
  // ============================================

  useEffect(() => {
    async function carregarConsultas() {
      const token = localStorage.getItem("token");

      if (!token || !id) {
        setCarregandoConsultas(false);
        return;
      }

      try {
        const resposta = await fetch(
          `http://localhost:3333/consultas/paciente/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const dados = await resposta.json();

        // ============================================
        // TOKEN EXPIRADO / INVÁLIDO
        // ============================================

        if (resposta.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("veterinario");

          navegar("/");
          return;
        }

        // ============================================
        // ERRO AO BUSCAR CONSULTAS
        // ============================================

        if (!resposta.ok) {
          console.error(
            "Erro ao buscar consultas:",
            dados.mensagem
          );

          return;
        }

        setConsultas(dados);

      } catch (erro) {
        console.error(
          "Erro ao buscar histórico:",
          erro
        );

      } finally {
        setCarregandoConsultas(false);
      }
    }

    carregarConsultas();

  }, [id, navegar]);


  // ============================================
  // FORMATAÇÃO DA DATA
  // ============================================

  function formatarData(data: string) {
    const dataConsulta = new Date(data);

    return dataConsulta.toLocaleDateString(
      "pt-BR"
    );
  }


  // ============================================
  // FORMATAÇÃO DO HORÁRIO
  // ============================================

  function formatarHorario(data: string) {
    const dataConsulta = new Date(data);

    return dataConsulta.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }


  // ============================================
  // ESTADO: CARREGANDO PACIENTE
  // ============================================

  if (carregando) {
    return (
      <div style={styles.page}>

        <div className="container-fluid px-4 py-4">

          <div style={styles.message}>
            Carregando paciente...
          </div>

        </div>

      </div>
    );
  }


  // ============================================
  // PACIENTE NÃO ENCONTRADO
  // ============================================

  if (!paciente) {
    return (
      <div style={styles.page}>

        <div className="container-fluid px-4 py-4">

          <div style={styles.message}>

            <div style={styles.emptyTitle}>
              Paciente não encontrado
            </div>

            <button
              type="button"
              style={styles.backButton}
              onClick={() =>
                navegar("/listapaciente")
              }
            >
              Voltar para pacientes
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ============================================
  // TELA
  // ============================================

  return (
    <div style={styles.page}>

      <div className="container-fluid px-4 py-4">

        {/* ========================================
            VOLTAR
        ======================================== */}

        <button
          type="button"
          style={styles.backLink}
          onClick={() =>
            navegar("/listapaciente")
          }
        >
          ← Voltar para pacientes
        </button>


        {/* ========================================
            CONTEÚDO
        ======================================== */}

        <div style={styles.container}>


          {/* ========================================
              CABEÇALHO DO PACIENTE
          ======================================== */}

          <div style={styles.patientHeader}>

            <div>

              <h1 style={styles.title}>
                {paciente.nome_animal}
              </h1>

              <p style={styles.subtitle}>

                {paciente.especie}

                {paciente.raca && (
                  <>
                    {" • "}
                    {paciente.raca}
                  </>
                )}

              </p>

            </div>

          </div>


          {/* ========================================
              DADOS DO PACIENTE
          ======================================== */}

          <div
            className="card border-0"
            style={styles.card}
          >

            <div className="card-body p-4">

              <h2 style={styles.sectionTitle}>
                Dados do paciente
              </h2>

              <div className="row g-4">

                <div className="col-12 col-md-6">

                  <div style={styles.label}>
                    Nome
                  </div>

                  <div style={styles.value}>
                    {paciente.nome_animal}
                  </div>

                </div>


                <div className="col-12 col-md-6">

                  <div style={styles.label}>
                    Espécie
                  </div>

                  <div style={styles.value}>
                    {paciente.especie}
                  </div>

                </div>


                <div className="col-12 col-md-6">

                  <div style={styles.label}>
                    Raça
                  </div>

                  <div style={styles.value}>
                    {paciente.raca ||
                      "Não informado"}
                  </div>

                </div>


                <div className="col-12 col-md-6">

                  <div style={styles.label}>
                    Sexo
                  </div>

                  <div style={styles.value}>
                    {paciente.sexo ||
                      "Não informado"}
                  </div>

                </div>


                <div className="col-12 col-md-6">

                  <div style={styles.label}>
                    Idade
                  </div>

                  <div style={styles.value}>
                    {paciente.idade ||
                      "Não informado"}
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* ========================================
              DADOS DO TUTOR
          ======================================== */}

          <div
            className="card border-0"
            style={styles.card}
          >

            <div className="card-body p-4">

              <h2 style={styles.sectionTitle}>
                Dados do tutor
              </h2>

              <div className="row g-4">

                <div className="col-12 col-md-6">

                  <div style={styles.label}>
                    Nome
                  </div>

                  <div style={styles.value}>
                    {paciente.nome_tutor}
                  </div>

                </div>


                <div className="col-12 col-md-6">

                  <div style={styles.label}>
                    Telefone
                  </div>

                  <div style={styles.value}>
                    {paciente.telefone_tutor ||
                      "Não informado"}
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* ========================================
              HISTÓRICO DE CONSULTAS
          ======================================== */}

          <div
            className="card border-0"
            style={styles.card}
          >

            <div className="card-body p-4">

              {/* ========================================
                  CABEÇALHO DO HISTÓRICO
              ======================================== */}

              <div style={styles.historyHeader}>

                <div>

                  <h2 style={styles.sectionTitle}>
                    Histórico de consultas
                  </h2>

                  <p style={styles.historyDescription}>
                    Consultas e atendimentos registrados
                    para este paciente.
                  </p>

                </div>


                {/* ========================================
                    NOVA CONSULTA
                ======================================== */}

                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() =>
                    navegar(
                      `/consulta/${paciente.id}`
                    )
                  }
                >
                  Nova consulta
                </button>

              </div>


              {/* ========================================
                  CARREGANDO CONSULTAS
              ======================================== */}

              {carregandoConsultas && (

                <div style={styles.emptyHistory}>

                  <div style={styles.emptyHistoryTitle}>
                    Carregando histórico...
                  </div>

                </div>

              )}


              {/* ========================================
                  NENHUMA CONSULTA
              ======================================== */}

              {!carregandoConsultas &&
                consultas.length === 0 && (

                  <div style={styles.emptyHistory}>

                    <div
                      style={styles.emptyHistoryTitle}
                    >
                      Nenhuma consulta registrada
                    </div>

                    <div
                      style={
                        styles.emptyHistoryDescription
                      }
                    >
                      As consultas deste paciente
                      aparecerão aqui.
                    </div>

                  </div>

                )}


              {/* ========================================
                  LISTA DE CONSULTAS
              ======================================== */}

              {!carregandoConsultas &&
                consultas.length > 0 && (

                  <div style={styles.consultasList}>

                    {consultas.map((consulta) => (

                      <div
                        key={consulta.id}
                        style={styles.consultaItem}
                      >

                        {/* ==================================
                            DATA E HORÁRIO
                        ================================== */}

                        <div
                          style={styles.consultaData}
                        >

                          <div
                            style={
                              styles.consultaDataPrincipal
                            }
                          >
                            {formatarData(
                              consulta.data_consulta
                            )}
                          </div>

                          <div
                            style={
                              styles.consultaHorario
                            }
                          >
                            {formatarHorario(
                              consulta.data_consulta
                            )}
                          </div>

                        </div>


                        {/* ==================================
                            INFORMAÇÕES DA CONSULTA
                        ================================== */}

                        <div
                          style={
                            styles.consultaInformacoes
                          }
                        >

                          <div
                            style={
                              styles.consultaTitulo
                            }
                          >
                            Consulta
                          </div>

                          <div
                            style={
                              styles.consultaMotivo
                            }
                          >
                            {consulta.motivo ||
                              "Motivo não informado."}
                          </div>

                        </div>


                        {/* ==================================
                            BOTÃO VISUALIZAR
                        ================================== */}

                        <button
                          type="button"
                          style={
                            styles.visualizarButton
                          }
                          onClick={() =>
                            navegar(
                              `/consultas/${consulta.id}`
                            )
                          }
                        >
                          Visualizar
                        </button>

                      </div>

                    ))}

                  </div>

                )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


// ============================================
// ESTILOS
// ============================================

const styles: Record<
  string,
  React.CSSProperties
> = {

  page: {
    minHeight: "calc(100vh - 72px)",
    backgroundColor: "#f4f7fb",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  backLink: {
    display: "block",
    padding: "0",
    marginBottom: "18px",
    backgroundColor: "transparent",
    border: "none",
    color: "#4a4b4d",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "left",
  },

  patientHeader: {
    marginBottom: "24px",
  },

  title: {
    margin: "0",
    color: "#111827",
    fontSize: "30px",
    fontWeight: "700",
  },

  subtitle: {
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  card: {
    marginBottom: "20px",
    borderRadius: "14px",
    boxShadow:
      "0 5px 20px rgba(0, 0, 0, 0.05)",
  },

  sectionTitle: {
    margin: "0",
    color: "#111827",
    fontSize: "17px",
    fontWeight: "600",
  },

  label: {
    marginBottom: "5px",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: "500",
  },

  value: {
    color: "#111827",
    fontSize: "15px",
    fontWeight: "600",
  },

  historyHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
  },

  historyDescription: {
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  primaryButton: {
    flexShrink: 0,
    padding: "10px 16px",
    backgroundColor: "#4a4b4d",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  // ============================================
  // LISTA DE CONSULTAS
  // ============================================

  consultasList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  consultaItem: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "18px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #eef1f5",
  },

  consultaData: {
    minWidth: "110px",
  },

  consultaDataPrincipal: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: "600",
  },

  consultaHorario: {
    marginTop: "3px",
    color: "#6b7280",
    fontSize: "12px",
  },

  consultaInformacoes: {
    flex: 1,
  },

  consultaTitulo: {
    marginBottom: "4px",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "600",
  },

  consultaMotivo: {
    color: "#6b7280",
    fontSize: "13px",

    // Evita que textos muito grandes
    // destruam o layout.
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  visualizarButton: {
    flexShrink: 0,
    padding: "8px 14px",
    backgroundColor: "#ffffff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  emptyHistory: {
    padding: "32px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    textAlign: "center",
  },

  emptyHistoryTitle: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: "600",
  },

  emptyHistoryDescription: {
    marginTop: "5px",
    color: "#6b7280",
    fontSize: "13px",
  },

  message: {
    padding: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    textAlign: "center",
    boxShadow:
      "0 5px 20px rgba(0, 0, 0, 0.05)",
  },

  emptyTitle: {
    marginBottom: "18px",
    color: "#111827",
    fontSize: "16px",
    fontWeight: "600",
  },

  backButton: {
    padding: "10px 16px",
    backgroundColor: "#4a4b4d",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
};

export default DetalhePaciente;