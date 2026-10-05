import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


// ============================================================
// TICKET 01 - INTERFACES
// ============================================================

interface Consulta {
  id: number;
  paciente_id: number;
  data_consulta: string;
  motivo: string;
  diagnostico: string;
  observacoes: string;
  nome_animal: string;
  nome_tutor: string;
}


// ============================================================
// TICKET 02 - COMPONENTE DASHBOARD
// ============================================================

function Dashboard() {

  const navegar = useNavigate();

  const [quantidadePacientes, setQuantidadePacientes] = useState(0);
  const [quantidadeConsultas, setQuantidadeConsultas] = useState(0);

  const [consultasRecentes, setConsultasRecentes] = useState<Consulta[]>([]);

  const [carregando, setCarregando] = useState(true);


  // ============================================================
  // TICKET 03 - CARREGAR DADOS DO DASHBOARD
  // ============================================================

  useEffect(() => {

    const carregarDashboard = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        navegar("/");
        return;
      }


      try {

        // ======================================================
        // BUSCAR PACIENTES
        // ======================================================

        const respostaPacientes = await fetch(
          "http://localhost:3333/pacientes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        if (respostaPacientes.status === 401) {

          localStorage.removeItem("token");
          localStorage.removeItem("veterinario");

          navegar("/");
          return;
        }


        if (!respostaPacientes.ok) {
          throw new Error("Erro ao buscar pacientes.");
        }


        const pacientes = await respostaPacientes.json();

        setQuantidadePacientes(pacientes.length);


        // ======================================================
        // BUSCAR CONSULTAS
        // ======================================================

        const respostaConsultas = await fetch(
          "http://localhost:3333/consultas",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        if (respostaConsultas.status === 401) {

          localStorage.removeItem("token");
          localStorage.removeItem("veterinario");

          navegar("/");
          return;
        }


        if (!respostaConsultas.ok) {
          throw new Error("Erro ao buscar consultas.");
        }


        const consultas: Consulta[] =
          await respostaConsultas.json();


        // ======================================================
        // QUANTIDADE TOTAL DE CONSULTAS
        // ======================================================

        setQuantidadeConsultas(consultas.length);


        // ======================================================
        // CONSULTAS RECENTES
        //
        // O backend já retorna as consultas da mais recente
        // para a mais antiga.
        // Aqui pegamos somente as 5 primeiras.
        // ======================================================

        setConsultasRecentes(consultas.slice(0, 5));

      } catch (erro) {

        console.error(
          "Erro ao carregar Dashboard:",
          erro
        );

      } finally {

        setCarregando(false);

      }

    };


    carregarDashboard();

  }, [navegar]);


  // ============================================================
  // TICKET 04 - DADOS DO VETERINÁRIO
  // ============================================================

  const veterinarioSalvo =
    localStorage.getItem("veterinario");

  let veterinario = null;

  try {

    veterinario = veterinarioSalvo
      ? JSON.parse(veterinarioSalvo)
      : null;

  } catch (erro) {

    console.error(
      "Erro ao ler dados do veterinário:",
      erro
    );

  }


  // ============================================================
  // TICKET 04.1 - NOME E TRATAMENTO DO VETERINÁRIO
  // ============================================================

  const nomeCompleto =
    veterinario?.nome ||
    veterinario?.nome_completo ||
    "Breno";

  const primeiroNome =
    String(nomeCompleto)
      .trim()
      .split(" ")[0];

  const tratamento =
    veterinario?.tratamento || "Dr.";

  const saudacao =
    tratamento === "Dra."
      ? "Seja bem-vinda"
      : "Seja bem-vindo";


  // ============================================================
  // TICKET 05 - FORMATAÇÃO DE DATA E HORA
  // ============================================================

  const formatarData = (data: string) => {

    return new Date(data).toLocaleDateString(
      "pt-BR"
    );

  };


  const formatarHorario = (data: string) => {

    return new Date(data).toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  // ============================================================
  // TICKET 06 - RENDERIZAÇÃO
  // ============================================================

  return (

    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        backgroundColor: "#f4f7fb",
        width: "100%",
      }}
    >

      <div
        className="container-fluid px-3 px-md-4 py-4"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >


        {/* ======================================================
            SAUDAÇÃO
        ====================================================== */}

        <div className="mb-4">

          <h1
            className="mb-1"
            style={{
              color: "#111827",
              fontSize: "28px",
              fontWeight: "700",
            }}
          >
            Olá, {tratamento} {primeiroNome}
          </h1>

          <p
            className="mb-0"
            style={{
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            {saudacao} ao S.O.V.
          </p>

        </div>


        {/* ======================================================
            TICKET 07 - INDICADORES
        ====================================================== */}

        <div className="row g-4 mb-4">


          {/* ====================================================
              CARD - PACIENTES
          ==================================================== */}

          <div className="col-12 col-md-6">

            <button
              type="button"
              onClick={() => navegar("/listapaciente")}
              className="card border-0 h-100 w-100 text-start"
              style={{
                borderRadius: "14px",
                boxShadow:
                  "0 5px 20px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                padding: 0,
              }}
            >

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Pacientes cadastrados
                    </div>


                    <div
                      className="mt-2"
                      style={{
                        color: "#111827",
                        fontSize: "30px",
                        fontWeight: "700",
                      }}
                    >
                      {carregando
                        ? "..."
                        : quantidadePacientes}
                    </div>

                  </div>


                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "44px",
                      height: "44px",
                      backgroundColor: "#f4f7fb",
                      borderRadius: "12px",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    🐾
                  </div>

                </div>

              </div>

            </button>

          </div>


          {/* ====================================================
              CARD - CONSULTAS
          ==================================================== */}

          <div className="col-12 col-md-6">

            <button
              type="button"
              onClick={() => navegar("/consultas")}
              className="card border-0 h-100 w-100 text-start"
              style={{
                borderRadius: "14px",
                boxShadow:
                  "0 5px 20px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                padding: 0,
              }}
            >

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Consultas realizadas
                    </div>


                    <div
                      className="mt-2"
                      style={{
                        color: "#111827",
                        fontSize: "30px",
                        fontWeight: "700",
                      }}
                    >
                      {carregando
                        ? "..."
                        : quantidadeConsultas}
                    </div>

                  </div>


                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "44px",
                      height: "44px",
                      backgroundColor: "#f4f7fb",
                      borderRadius: "12px",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    📋
                  </div>

                </div>

              </div>

            </button>

          </div>

        </div>


        {/* ======================================================
            TICKET 08 - AÇÕES RÁPIDAS
        ====================================================== */}

        <div className="mb-4">

          <h2
            className="mb-3"
            style={{
              color: "#111827",
              fontSize: "19px",
              fontWeight: "600",
            }}
          >
            Ações rápidas
          </h2>


          <div className="row g-3">


            {/* ==================================================
                NOVO PACIENTE
            ================================================== */}

            <div className="col-12 col-md-6">

              <button
                type="button"
                className="w-100 border-0 text-start"
                onClick={() => navegar("/paciente")}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  boxShadow:
                    "0 5px 20px rgba(0, 0, 0, 0.05)",
                  cursor: "pointer",
                }}
              >

                <div className="d-flex align-items-center gap-3">

                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "44px",
                      height: "44px",
                      backgroundColor: "#f4f7fb",
                      borderRadius: "10px",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    🐾
                  </div>


                  <div>

                    <div
                      style={{
                        color: "#111827",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Novo paciente
                    </div>


                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        marginTop: "3px",
                      }}
                    >
                      Cadastrar um novo paciente
                    </div>

                  </div>

                </div>

              </button>

            </div>


            {/* ==================================================
                NOVA CONSULTA
            ================================================== */}

            <div className="col-12 col-md-6">

              <button
                type="button"
                className="w-100 border-0 text-start"
                onClick={() => navegar("/listapaciente")}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  boxShadow:
                    "0 5px 20px rgba(0, 0, 0, 0.05)",
                  cursor: "pointer",
                }}
              >

                <div className="d-flex align-items-center gap-3">

                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "44px",
                      height: "44px",
                      backgroundColor: "#f4f7fb",
                      borderRadius: "10px",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    📋
                  </div>


                  <div>

                    <div
                      style={{
                        color: "#111827",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Nova consulta
                    </div>


                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        marginTop: "3px",
                      }}
                    >
                      Selecionar um paciente
                    </div>

                  </div>

                </div>

              </button>

            </div>

          </div>

        </div>


        {/* ======================================================
            TICKET 09 - CONSULTAS RECENTES
        ====================================================== */}

        <div>

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h2
              className="mb-0"
              style={{
                color: "#111827",
                fontSize: "19px",
                fontWeight: "600",
              }}
            >
              Consultas recentes
            </h2>

          </div>


          {carregando ? (

            <div
              className="card border-0"
              style={{
                borderRadius: "14px",
                boxShadow:
                  "0 5px 20px rgba(0, 0, 0, 0.05)",
              }}
            >

              <div
                className="card-body p-4"
                style={{
                  color: "#6b7280",
                }}
              >
                Carregando consultas...
              </div>

            </div>

          ) : consultasRecentes.length === 0 ? (

            <div
              className="card border-0"
              style={{
                borderRadius: "14px",
                boxShadow:
                  "0 5px 20px rgba(0, 0, 0, 0.05)",
              }}
            >

              <div
                className="card-body p-4"
                style={{
                  color: "#6b7280",
                }}
              >
                Nenhuma consulta registrada ainda.
              </div>

            </div>

          ) : (

            <div className="row g-3">

              {consultasRecentes.map((consulta) => (

                <div
                  key={consulta.id}
                  className="col-12"
                >

                  <div
                    className="card border-0"
                    style={{
                      borderRadius: "14px",
                      boxShadow:
                        "0 5px 20px rgba(0, 0, 0, 0.05)",
                    }}
                  >

                    <div className="card-body p-4">

                      <div className="row align-items-center g-3">


                        {/* ========================================
                            PACIENTE
                        ======================================== */}

                        <div className="col-12 col-md-4">

                          <div
                            style={{
                              color: "#111827",
                              fontSize: "15px",
                              fontWeight: "600",
                            }}
                          >
                            {consulta.nome_animal}
                          </div>


                          <div
                            style={{
                              color: "#6b7280",
                              fontSize: "13px",
                              marginTop: "3px",
                            }}
                          >
                            Tutor: {consulta.nome_tutor}
                          </div>

                        </div>


                        {/* ========================================
                            MOTIVO
                        ======================================== */}

                        <div className="col-12 col-md-4">

                          <div
                            style={{
                              color: "#6b7280",
                              fontSize: "12px",
                              marginBottom: "3px",
                            }}
                          >
                            Motivo
                          </div>


                          <div
                            style={{
                              color: "#374151",
                              fontSize: "14px",
                            }}
                          >
                            {consulta.motivo || "Não informado"}
                          </div>

                        </div>


                        {/* ========================================
                            DATA + BOTÃO
                        ======================================== */}

                        <div className="col-12 col-md-4">

                          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-end gap-3">

                            <div>

                              <div
                                style={{
                                  color: "#374151",
                                  fontSize: "14px",
                                }}
                              >
                                {formatarData(
                                  consulta.data_consulta
                                )}
                              </div>


                              <div
                                style={{
                                  color: "#6b7280",
                                  fontSize: "12px",
                                  marginTop: "2px",
                                }}
                              >
                                {formatarHorario(
                                  consulta.data_consulta
                                )}
                              </div>

                            </div>


                            <button
                              type="button"
                              onClick={() =>
                                navegar(
                                  `/consultas/${consulta.id}`
                                )
                              }
                              className="btn"
                              style={{
                                backgroundColor: "#4a4b4d",
                                color: "#ffffff",
                                borderRadius: "8px",
                                fontSize: "13px",
                                padding: "8px 14px",
                                width: "100%",
                              }}
                            >
                              Visualizar
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  );

}


export default Dashboard;