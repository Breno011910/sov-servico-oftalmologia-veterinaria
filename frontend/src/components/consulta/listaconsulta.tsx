import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


// =====================================================
// TICKET: INTERFACE DA CONSULTA
// =====================================================

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


// =====================================================
// TICKET: COMPONENTE LISTA DE CONSULTAS
// =====================================================

function ListaConsulta() {

  const navegar = useNavigate();

  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(true);


  // =====================================================
  // TICKET: BUSCAR CONSULTAS
  // =====================================================

  useEffect(() => {

    async function carregarConsultas() {

      try {

        const token = localStorage.getItem("token");

        if (!token) {

          alert("Sessão expirada. Faça login novamente.");

          window.location.href = "/";

          return;
        }


        const resposta = await fetch(
          "http://localhost:3333/consultas",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        // =====================================================
        // TICKET: TOKEN INVÁLIDO OU EXPIRADO
        // =====================================================

        if (resposta.status === 401) {

          localStorage.removeItem("token");
          localStorage.removeItem("veterinario");

          alert("Sua sessão expirou. Faça login novamente.");

          window.location.href = "/";

          return;
        }


        // =====================================================
        // TICKET: OUTROS ERROS
        // =====================================================

        if (!resposta.ok) {

          const erro = await resposta.json();

          console.error(
            "Erro retornado pelo backend:",
            erro
          );

          alert(
            erro.erro ||
            "Não foi possível carregar as consultas."
          );

          return;
        }


        // =====================================================
        // TICKET: CONVERTER RESPOSTA
        // =====================================================

        const dados: Consulta[] = await resposta.json();


        // =====================================================
        // TICKET: SALVAR CONSULTAS
        // =====================================================

        setConsultas(dados);

      } catch (erro) {

        console.error(
          "Erro ao buscar consultas:",
          erro
        );

        alert(
          "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
        );

      } finally {

        setCarregando(false);

      }

    }


    carregarConsultas();

  }, []);


  // =====================================================
  // TICKET: FORMATAR DATA
  // =====================================================

  function formatarData(data: string) {

    if (!data) {
      return "-";
    }

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
      return data;
    }

    return dataObj.toLocaleDateString("pt-BR");
  }


  // =====================================================
  // TICKET: ABRIR DETALHES DA CONSULTA
  // =====================================================

  function visualizarConsulta(id: number) {

    navegar(`/consultas/${id}`);

  }


  // =====================================================
  // TICKET: CARREGANDO
  // =====================================================

  if (carregando) {

    return (
      <div style={styles.container}>

        <div style={styles.card}>

          <p style={styles.emptyMessage}>
            Carregando consultas...
          </p>

        </div>

      </div>
    );

  }


  // =====================================================
  // TICKET: TELA PRINCIPAL
  // =====================================================

  return (

    <div style={styles.container}>

      {/* =====================================================
          TICKET: CABEÇALHO
      ===================================================== */}

      <div style={styles.header}>

        <h1 style={styles.title}>
          Consultas
        </h1>

        <p style={styles.subtitle}>
          Histórico de consultas veterinárias
        </p>

      </div>


      {/* =====================================================
          TICKET: CARD DA LISTA
      ===================================================== */}

      <div style={styles.card}>

        <div style={styles.cardHeader}>

          <h2 style={styles.cardTitle}>
            Consultas cadastradas
          </h2>

          <span style={styles.counter}>
            {consultas.length}
          </span>

        </div>


        {/* =====================================================
            TICKET: NENHUMA CONSULTA
        ===================================================== */}

        {consultas.length === 0 ? (

          <p style={styles.emptyMessage}>
            Nenhuma consulta cadastrada.
          </p>

        ) : (

          <div style={styles.tableContainer}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    Data
                  </th>

                  <th style={styles.th}>
                    Paciente
                  </th>

                  <th style={styles.th}>
                    Tutor
                  </th>

                  <th style={styles.th}>
                    Motivo
                  </th>

                  <th style={styles.th}>
                    Diagnóstico
                  </th>

                  <th style={styles.th}>
                    Ações
                  </th>

                </tr>

              </thead>


              <tbody>

                {consultas.map((consulta) => (

                  <tr key={consulta.id}>

                    <td style={styles.td}>
                      {formatarData(
                        consulta.data_consulta
                      )}
                    </td>

                    <td style={styles.td}>
                      {consulta.nome_animal}
                    </td>

                    <td style={styles.td}>
                      {consulta.nome_tutor}
                    </td>

                    <td style={styles.td}>
                      {consulta.motivo || "-"}
                    </td>

                    <td style={styles.td}>
                      {consulta.diagnostico || "-"}
                    </td>

                    <td style={styles.td}>

                      <button
                        type="button"
                        style={styles.viewButton}
                        onClick={() =>
                          visualizarConsulta(consulta.id)
                        }
                      >
                        Visualizar
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

}


// =====================================================
// TICKET: ESTILOS
// =====================================================

const styles: Record<string, React.CSSProperties> = {

  container: {
    padding: "32px",
    minHeight: "100vh",
    backgroundColor: "#f4f5f7",
    boxSizing: "border-box",
  },

  header: {
    marginBottom: "28px",
  },

  title: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: "700",
    color: "#303133",
  },

  subtitle: {
    margin: "0",
    fontSize: "14px",
    color: "#6b7280",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: "0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#303133",
  },

  counter: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "24px",
    height: "24px",
    padding: "0 7px",
    borderRadius: "12px",
    backgroundColor: "#4a4b4d",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "600",
    boxSizing: "border-box",
  },

  emptyMessage: {
    margin: "0",
    color: "#6b7280",
    fontSize: "14px",
  },

  tableContainer: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },

  th: {
    padding: "14px 12px",
    textAlign: "left",
    borderBottom: "2px solid #e5e7eb",
    color: "#4b5563",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px 12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
    verticalAlign: "middle",
  },

  viewButton: {
    padding: "8px 14px",
    backgroundColor: "#4a4b4d",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

};

export default ListaConsulta;