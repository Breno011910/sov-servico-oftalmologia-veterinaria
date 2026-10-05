import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Paciente {
  id: number;
  nome_animal: string;
  especie: string;
  raca?: string;
  sexo?: string;
  idade?: string;
  nome_tutor: string;
  telefone_tutor?: string;
  criado_em: string;
}

function ListaPaciente() {
  const navegar = useNavigate();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPacientes() {
      const token = localStorage.getItem("token");

      if (!token) {
        navegar("/");
        return;
      }

      try {
        const resposta = await fetch("http://localhost:3333/pacientes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dados = await resposta.json();

        // ============================================================
        // TICKET 01 - TOKEN EXPIRADO OU INVÁLIDO
        // ============================================================

        if (resposta.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("veterinario");
          navegar("/");
          return;
        }

        // ============================================================
        // TICKET 02 - TRATAMENTO DE ERRO
        // ============================================================

        if (!resposta.ok) {
          console.error(
            "Erro ao buscar pacientes:",
            dados.mensagem
          );
          return;
        }

        setPacientes(dados);

      } catch (erro) {
        console.error("Erro ao buscar pacientes:", erro);
      } finally {
        setCarregando(false);
      }
    }

    carregarPacientes();
  }, [navegar]);

  // ============================================================
  // TICKET 03 - FORMATAÇÃO DA DATA DE CADASTRO
  // ============================================================

  function formatarDataCadastro(data: string) {
    if (!data) {
      return "-";
    }

    const dataConvertida = new Date(data);

    if (isNaN(dataConvertida.getTime())) {
      return "-";
    }

    return dataConvertida.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div style={styles.page}>

      <div className="container-fluid px-4 py-4">

        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >

          {/* ======================================================
              TICKET 04 - CABEÇALHO
          ====================================================== */}

          <div className="mb-4">

            <h1 style={styles.title}>
              Pacientes
            </h1>

            <p style={styles.description}>
              Pacientes cadastrados no sistema.
            </p>

          </div>


          {/* ======================================================
              TICKET 05 - CARREGANDO
          ====================================================== */}

          {carregando ? (

            <div style={styles.message}>
              Carregando pacientes...
            </div>

          ) : pacientes.length === 0 ? (

            /* ====================================================
               TICKET 06 - LISTA VAZIA
            ==================================================== */

            <div style={styles.message}>

              <div style={styles.emptyTitle}>
                Nenhum paciente cadastrado
              </div>

              <div style={styles.emptyDescription}>
                Os pacientes cadastrados aparecerão aqui.
              </div>

            </div>

          ) : (

            /* ====================================================
               TICKET 07 - LISTA DE PACIENTES
            ==================================================== */

            <div
              className="card border-0"
              style={styles.tableCard}
            >

              <div className="table-responsive">

                <table
                  className="table mb-0"
                  style={styles.table}
                >

                  {/* ==================================================
                      TICKET 08 - CABEÇALHO DA TABELA
                  ================================================== */}

                  <thead>

                    <tr>

                      <th style={styles.headerCell}>
                        Paciente
                      </th>

                      <th style={styles.headerCell}>
                        Espécie
                      </th>

                      <th style={styles.headerCell}>
                        Raça
                      </th>

                      <th style={styles.headerCell}>
                        Sexo
                      </th>

                      <th style={styles.headerCell}>
                        Idade
                      </th>

                      <th style={styles.headerCell}>
                        Tutor
                      </th>

                      <th style={styles.headerCell}>
                        Cadastrado em
                      </th>

                      <th
                        style={{
                          ...styles.headerCell,
                          textAlign: "center",
                        }}
                      >
                        Ações
                      </th>

                    </tr>

                  </thead>


                  {/* ==================================================
                      TICKET 09 - DADOS DOS PACIENTES
                  ================================================== */}

                  <tbody>

                    {pacientes.map((paciente) => (

                      <tr key={paciente.id}>

                        {/* PACIENTE */}

                        <td style={styles.bodyCell}>

                          <span style={styles.patientName}>
                            {paciente.nome_animal}
                          </span>

                        </td>


                        {/* ESPÉCIE */}

                        <td style={styles.bodyCell}>
                          {paciente.especie || "-"}
                        </td>


                        {/* RAÇA */}

                        <td style={styles.bodyCell}>
                          {paciente.raca || "-"}
                        </td>


                        {/* SEXO */}

                        <td style={styles.bodyCell}>
                          {paciente.sexo || "-"}
                        </td>


                        {/* IDADE */}

                        <td style={styles.bodyCell}>
                          {paciente.idade || "-"}
                        </td>


                        {/* TUTOR */}

                        <td style={styles.bodyCell}>
                          {paciente.nome_tutor || "-"}
                        </td>


                        {/* DATA E HORA */}

                        <td style={styles.bodyCell}>
                          {formatarDataCadastro(
                            paciente.criado_em
                          )}
                        </td>


                        {/* AÇÕES */}

                        <td
                          style={{
                            ...styles.bodyCell,
                            textAlign: "center",
                          }}
                        >

                          <button
                            type="button"
                            style={styles.viewButton}
                            onClick={() =>
                              navegar(
                                `/paciente/${paciente.id}`
                              )
                            }
                          >
                            Ver
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


// ============================================================
// TICKET 10 - ESTILOS
// ============================================================

const styles: Record<string, React.CSSProperties> = {

  page: {
    minHeight: "calc(100vh - 72px)",
    backgroundColor: "#f4f7fb",
  },

  title: {
    margin: "0",
    color: "#111827",
    fontSize: "28px",
    fontWeight: "700",
  },

  description: {
    margin: "7px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  message: {
    padding: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    color: "#6b7280",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0, 0, 0, 0.05)",
  },

  emptyTitle: {
    color: "#111827",
    fontSize: "15px",
    fontWeight: "600",
  },

  emptyDescription: {
    marginTop: "5px",
    color: "#6b7280",
    fontSize: "13px",
  },

  tableCard: {
    borderRadius: "14px",
    boxShadow: "0 5px 20px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
  },

  table: {
    backgroundColor: "#ffffff",
    verticalAlign: "middle",
  },

  headerCell: {
    padding: "15px 16px",
    backgroundColor: "#f8fafc",
    color: "#4a4b4d",
    fontSize: "13px",
    fontWeight: "700",
    whiteSpace: "nowrap",
    borderBottom: "1px solid #e5e7eb",
  },

  bodyCell: {
    padding: "16px",
    color: "#6b7280",
    fontSize: "14px",
    borderBottom: "1px solid #f0f1f3",
    whiteSpace: "nowrap",
  },

  patientName: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: "700",
  },

  viewButton: {
    padding: "8px 15px",
    backgroundColor: "#4a4b4d",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

};

export default ListaPaciente;