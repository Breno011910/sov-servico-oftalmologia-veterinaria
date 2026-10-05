import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Consulta() {
  const { pacienteId } = useParams();
  const navegar = useNavigate();

  // =========================================================
  // TICKET: DADOS PRINCIPAIS DA CONSULTA
  // =========================================================

  const [dataConsulta, setDataConsulta] = useState("");
  const [anamnese, setAnamnese] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [observacoesDiagnostico, setObservacoesDiagnostico] = useState("");
  const [tratamento, setTratamento] = useState("");

  // =========================================================
  // TICKET: DADOS DO EXAME OFTALMOLÓGICO
  // =========================================================

  const [exame, setExame] = useState({
    // -------------------------------------------------------
    // OLHO DIREITO - OD
    // -------------------------------------------------------

    reflexo_pupilar_direto_od: "",
    reflexo_pupilar_consensual_od: "",
    teste_ameaca_od: "",
    schirmer_od: "",
    pressao_intraocular_od: "",
    fluoresceina_od: "",
    teste_jones_od: "",
    palpebra_od: "",
    secrecao_od: "",
    conjuntiva_od: "",
    cornea_od: "",
    camara_anterior_od: "",
    iris_od: "",
    pupila_od: "",
    lente_od: "",
    fundo_olho_od: "",
    vitreo_od: "",

    // -------------------------------------------------------
    // OLHO ESQUERDO - OE
    // -------------------------------------------------------

    reflexo_pupilar_direto_oe: "",
    reflexo_pupilar_consensual_oe: "",
    teste_ameaca_oe: "",
    schirmer_oe: "",
    pressao_intraocular_oe: "",
    fluoresceina_oe: "",
    teste_jones_oe: "",
    palpebra_oe: "",
    secrecao_oe: "",
    conjuntiva_oe: "",
    cornea_oe: "",
    camara_anterior_oe: "",
    iris_oe: "",
    pupila_oe: "",
    lente_oe: "",
    fundo_olho_oe: "",
    vitreo_oe: "",
  });

  // =========================================================
  // TICKET: ALTERAR CAMPO DO EXAME
  // =========================================================

  function alterarExame(
    campo: keyof typeof exame,
    valor: string
  ) {
    setExame((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  // =========================================================
  // TICKET: FORMATAÇÃO DA DATA
  // =========================================================

  function formatarData(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }

    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  }

  function alterarData(event: React.ChangeEvent<HTMLInputElement>) {
    setDataConsulta(formatarData(event.target.value));
  }

  // =========================================================
  // TICKET: SALVAR CONSULTA E EXAME OFTALMOLÓGICO
  // =========================================================

  async function salvarConsulta() {
    try {
      // -------------------------------------------------------
      // Verifica se o paciente foi identificado pela URL
      // -------------------------------------------------------

      if (!pacienteId) {
        alert("Paciente não identificado.");
        return;
      }

      // -------------------------------------------------------
      // Recupera o token utilizado no login
      // -------------------------------------------------------

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        navegar("/");
        return;
      }

      // =======================================================
      // TICKET: ETAPA 1 - SALVAR CONSULTA
      // =======================================================

      const respostaConsulta = await fetch(
        "http://localhost:3333/consultas",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            paciente_id: Number(pacienteId),
            motivo: anamnese,
            diagnostico: diagnostico,
            observacoes: observacoesDiagnostico,
          }),
        }
      );

      // -------------------------------------------------------
      // Converte resposta da consulta para JSON
      // -------------------------------------------------------

      const dadosConsulta = await respostaConsulta.json();

      // -------------------------------------------------------
      // Trata erro da criação da consulta
      // -------------------------------------------------------

      if (!respostaConsulta.ok) {
        console.error(
          "Erro ao salvar consulta:",
          dadosConsulta
        );

        if (respostaConsulta.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("veterinario");

          alert("Sessão expirada. Faça login novamente.");
          navegar("/");
          return;
        }

        alert(
          dadosConsulta.erro ||
            "Não foi possível salvar a consulta."
        );

        return;
      }

      // -------------------------------------------------------
      // O backend retorna o ID da consulta criada
      // -------------------------------------------------------

      const consultaId = dadosConsulta.consulta_id;

      if (!consultaId) {
        console.error(
          "Backend não retornou consulta_id:",
          dadosConsulta
        );

        alert(
          "A consulta foi criada, mas o identificador não foi retornado pelo servidor."
        );

        return;
      }

      console.log(
        "Consulta criada com sucesso:",
        consultaId
      );

      // =======================================================
      // TICKET: ETAPA 2 - SALVAR EXAME OFTALMOLÓGICO
      // =======================================================

      const respostaExame = await fetch(
        "http://localhost:3333/exames-oftalmologicos",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            // -------------------------------------------------
            // Identificação da consulta
            // -------------------------------------------------

            consulta_id: consultaId,

            // -------------------------------------------------
            // OLHO DIREITO - OD
            // -------------------------------------------------

            reflexo_pupilar_direto_od:
              exame.reflexo_pupilar_direto_od,

            reflexo_pupilar_consensual_od:
              exame.reflexo_pupilar_consensual_od,

            teste_ameaca_od:
              exame.teste_ameaca_od,

            schirmer_od:
              exame.schirmer_od,

            pressao_intraocular_od:
              exame.pressao_intraocular_od,

            fluoresceina_od:
              exame.fluoresceina_od,

            teste_jones_od:
              exame.teste_jones_od,

            palpebra_od:
              exame.palpebra_od,

            secrecao_od:
              exame.secrecao_od,

            conjuntiva_od:
              exame.conjuntiva_od,

            cornea_od:
              exame.cornea_od,

            camara_anterior_od:
              exame.camara_anterior_od,

            iris_od:
              exame.iris_od,

            pupila_od:
              exame.pupila_od,

            lente_od:
              exame.lente_od,

            fundo_olho_od:
              exame.fundo_olho_od,

            vitreo_od:
              exame.vitreo_od,

            // -------------------------------------------------
            // OLHO ESQUERDO - OE
            // -------------------------------------------------

            reflexo_pupilar_direto_oe:
              exame.reflexo_pupilar_direto_oe,

            reflexo_pupilar_consensual_oe:
              exame.reflexo_pupilar_consensual_oe,

            teste_ameaca_oe:
              exame.teste_ameaca_oe,

            schirmer_oe:
              exame.schirmer_oe,

            pressao_intraocular_oe:
              exame.pressao_intraocular_oe,

            fluoresceina_oe:
              exame.fluoresceina_oe,

            teste_jones_oe:
              exame.teste_jones_oe,

            palpebra_oe:
              exame.palpebra_oe,

            secrecao_oe:
              exame.secrecao_oe,

            conjuntiva_oe:
              exame.conjuntiva_oe,

            cornea_oe:
              exame.cornea_oe,

            camara_anterior_oe:
              exame.camara_anterior_oe,

            iris_oe:
              exame.iris_oe,

            pupila_oe:
              exame.pupila_oe,

            lente_oe:
              exame.lente_oe,

            fundo_olho_oe:
              exame.fundo_olho_oe,

            vitreo_oe:
              exame.vitreo_oe,
          }),
        }
      );

      // -------------------------------------------------------
      // Converte resposta do exame para JSON
      // -------------------------------------------------------

      const dadosExame = await respostaExame.json();

      // -------------------------------------------------------
      // Trata erro da criação do exame
      // -------------------------------------------------------

      if (!respostaExame.ok) {
        console.error(
          "Erro ao salvar exame oftalmológico:",
          dadosExame
        );

        if (respostaExame.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("veterinario");

          alert("Sessão expirada. Faça login novamente.");
          navegar("/");
          return;
        }

        alert(
          dadosExame.erro ||
            "A consulta foi criada, mas não foi possível salvar o exame oftalmológico."
        );

        return;
      }

      // -------------------------------------------------------
      // Consulta + exame salvos
      // -------------------------------------------------------

      console.log(
        "Exame oftalmológico criado:",
        dadosExame
      );

      // =======================================================
      // TICKET: FINALIZAÇÃO
      // =======================================================

      alert(
        "Consulta e exame oftalmológico registrados com sucesso!"
      );

      navegar(`/paciente/${pacienteId}`);

    } catch (erro) {
      // -------------------------------------------------------
      // Erro de conexão com o backend
      // -------------------------------------------------------

      console.error(
        "Erro ao salvar consulta:",
        erro
      );

      alert(
        "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
      );
    }
  }

  // =========================================================
  // TICKET: GERAR RELATÓRIO PDF
  // =========================================================

  function gerarRelatorioPDF() {
    console.log(
      "Geração do relatório PDF será implementada futuramente."
    );
  }

  return (
    <div style={styles.page}>

      <div className="container-fluid px-4 py-4">

        {/* =====================================================
            TICKET: VOLTAR PARA O PACIENTE
        ===================================================== */}

        <button
          type="button"
          style={styles.backLink}
          onClick={() =>
            navegar(`/paciente/${pacienteId}`)
          }
        >
          ← Voltar para paciente
        </button>

        <div style={styles.container}>

          {/* =====================================================
              TICKET: CABEÇALHO
          ===================================================== */}

          <div style={styles.header}>

            <h1 style={styles.title}>
              Nova consulta
            </h1>

            <p style={styles.description}>
              Registre o atendimento oftalmológico do paciente.
            </p>

          </div>

          {/* =====================================================
              TICKET: IDENTIFICAÇÃO DA CONSULTA
          ===================================================== */}

          <div
            className="card border-0"
            style={styles.card}
          >

            <div className="card-body p-4">

              <h2 style={styles.sectionTitle}>
                Identificação da consulta
              </h2>

              <div className="row g-4 mt-1">

                <div className="col-12 col-md-4">

                  <label style={styles.label}>
                    Data da consulta
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={dataConsulta}
                    onChange={alterarData}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    style={styles.input}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
              TICKET: ANAMNESE
          ===================================================== */}

          <div
            className="card border-0"
            style={styles.card}
          >

            <div className="card-body p-4">

              <h2 style={styles.sectionTitle}>
                Anamnese
              </h2>

              <p style={styles.descriptionSection}>
                Registre a queixa principal e o histórico informado pelo tutor.
              </p>

              <textarea
                style={styles.textarea}
                placeholder="Digite a queixa principal, início dos sinais, evolução e outras informações relevantes..."
                rows={5}
                value={anamnese}
                onChange={(event) =>
                  setAnamnese(event.target.value)
                }
              />

            </div>

          </div>

          {/* =====================================================
              TICKET: EXAME OFTALMOLÓGICO
          ===================================================== */}

          <div
            className="card border-0"
            style={styles.card}
          >

            <div className="card-body p-4">

              <h2 style={styles.sectionTitle}>
                Exame oftalmológico
              </h2>

              <p style={styles.descriptionSection}>
                Registre os dados de cada olho individualmente.
              </p>

              {/* =================================================
                  TICKET: FORMULÁRIOS DOS OLHOS
              ================================================= */}

              <div className="row g-4">

                {/* =================================================
                    TICKET: OLHO ESQUERDO — OE
                ================================================= */}

                <div className="col-12 col-md-6">

                  <div style={styles.eyeCard}>

                    <div style={styles.eyeHeader}>
                      OE — Olho Esquerdo
                    </div>

                    {/* =================================================
                        TICKET: REFLEXOS E VISÃO — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Reflexos e visão
                      </h3>

                      <div className="d-flex flex-column gap-4">

                        <CampoSelect
                          label="Reflexo pupilar direto — OE"
                          name="reflexoPupilarDiretoOE"
                          value={
                            exame.reflexo_pupilar_direto_oe
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "reflexo_pupilar_direto_oe",
                              valor
                            )
                          }
                          options={[
                            "Presente",
                            "Ausente",
                            "Reduzido",
                            "Alterado",
                          ]}
                        />

                        <CampoSelect
                          label="Reflexo pupilar consensual — OE"
                          name="reflexoConsensualOE"
                          value={
                            exame.reflexo_pupilar_consensual_oe
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "reflexo_pupilar_consensual_oe",
                              valor
                            )
                          }
                          options={[
                            "Presente",
                            "Ausente",
                            "Reduzido",
                            "Alterado",
                          ]}
                        />

                        <CampoSelect
                          label="Teste de ameaça — OE"
                          name="ameacaOE"
                          value={
                            exame.teste_ameaca_oe
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "teste_ameaca_oe",
                              valor
                            )
                          }
                          options={[
                            "Presente",
                            "Ausente",
                            "Reduzido",
                            "Alterado",
                          ]}
                        />

                      </div>

                    </div>

                    {/* =================================================
                        TICKET: TESTES OFTALMOLÓGICOS — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Testes oftalmológicos
                      </h3>

                      <div className="d-flex flex-column gap-4">

                        <CampoTexto
                          label="Schirmer — OE"
                          name="schirmerOE"
                          placeholder="mm/min"
                          value={exame.schirmer_oe}
                          onChange={(valor) =>
                            alterarExame(
                              "schirmer_oe",
                              valor
                            )
                          }
                        />

                        <CampoTexto
                          label="Pressão intraocular — OE"
                          name="pressaoOE"
                          placeholder="mmHg"
                          value={
                            exame.pressao_intraocular_oe
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "pressao_intraocular_oe",
                              valor
                            )
                          }
                        />

                        <CampoSelect
                          label="Fluoresceína — OE"
                          name="fluoresceinaOE"
                          value={
                            exame.fluoresceina_oe
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "fluoresceina_oe",
                              valor
                            )
                          }
                          options={[
                            "Negativa",
                            "Positiva",
                            "Não realizado",
                          ]}
                        />

                        <CampoSelect
                          label="Teste de Jones — OE"
                          name="jonesOE"
                          value={
                            exame.teste_jones_oe
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "teste_jones_oe",
                              valor
                            )
                          }
                          options={[
                            "Positivo",
                            "Negativo",
                            "Não realizado",
                          ]}
                        />

                      </div>

                    </div>

                    {/* =================================================
                        TICKET: PÁLPEBRAS — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Pálpebras
                      </h3>

                      <CampoSelect
                        label="Pálpebra — OE"
                        name="palpebraOE"
                        value={exame.palpebra_oe}
                        onChange={(valor) =>
                          alterarExame(
                            "palpebra_oe",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Alterada",
                          "Não avaliada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: SECREÇÃO OCULAR — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Secreção ocular
                      </h3>

                      <CampoSelect
                        label="Secreção — OE"
                        name="secrecaoOE"
                        value={exame.secrecao_oe}
                        onChange={(valor) =>
                          alterarExame(
                            "secrecao_oe",
                            valor
                          )
                        }
                        options={[
                          "Ausente",
                          "Serosa",
                          "Mucosa",
                          "Purulenta",
                          "Hemorrágica",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: CONJUNTIVA — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Conjuntiva
                      </h3>

                      <CampoSelect
                        label="Conjuntiva — OE"
                        name="conjuntivaOE"
                        value={exame.conjuntiva_oe}
                        onChange={(valor) =>
                          alterarExame(
                            "conjuntiva_oe",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Hiperêmica",
                          "Edemaciada",
                          "Alterada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: CÓRNEA — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Córnea
                      </h3>

                      <CampoSelect
                        label="Córnea — OE"
                        name="corneaOE"
                        value={exame.cornea_oe}
                        onChange={(valor) =>
                          alterarExame(
                            "cornea_oe",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Edema",
                          "Opacidade",
                          "Úlcera",
                          "Lesão",
                          "Alterada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: CÂMARA ANTERIOR — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Câmara anterior
                      </h3>

                      <CampoSelect
                        label="Câmara anterior — OE"
                        name="camaraOE"
                        value={
                          exame.camara_anterior_oe
                        }
                        onChange={(valor) =>
                          alterarExame(
                            "camara_anterior_oe",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Alterada",
                          "Não avaliada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: ÍRIS — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Íris
                      </h3>

                      <CampoSelect
                        label="Íris — OE"
                        name="irisOE"
                        value={exame.iris_oe}
                        onChange={(valor) =>
                          alterarExame(
                            "iris_oe",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Alterada",
                          "Não avaliada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: PUPILA — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Pupila
                      </h3>

                      <CampoSelect
                        label="Pupila — OE"
                        name="pupilaOE"
                        value={exame.pupila_oe}
                        onChange={(valor) =>
                          alterarExame(
                            "pupila_oe",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Miótica",
                          "Midriática",
                          "Anisocoria",
                          "Alterada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: LENTE — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Lente
                      </h3>

                      <CampoSelect
                        label="Lente — OE"
                        name="lenteOE"
                        value={exame.lente_oe}
                        onChange={(valor) =>
                          alterarExame(
                            "lente_oe",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Catarata",
                          "Luxação",
                          "Opacidade",
                          "Alterada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: FUNDO DE OLHO — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Fundo de olho
                      </h3>

                      <CampoSelect
                        label="Fundo de olho — OE"
                        name="fundoOE"
                        value={exame.fundo_olho_oe}
                        onChange={(valor) =>
                          alterarExame(
                            "fundo_olho_oe",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Alterado",
                          "Não visualizado",
                          "Não avaliado",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: VÍTREO — OE
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Vítreo
                      </h3>

                      <CampoSelect
                        label="Vítreo — OE"
                        name="vitreoOE"
                        value={exame.vitreo_oe}
                        onChange={(valor) =>
                          alterarExame(
                            "vitreo_oe",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Alterado",
                          "Não visualizado",
                          "Não avaliado",
                        ]}
                      />

                    </div>

                  </div>

                </div>

                {/* =================================================
                    TICKET: OLHO DIREITO — OD
                ================================================= */}

                <div className="col-12 col-md-6">

                  <div style={styles.eyeCard}>

                    <div style={styles.eyeHeader}>
                      OD — Olho Direito
                    </div>

                    {/* =================================================
                        TICKET: REFLEXOS E VISÃO — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Reflexos e visão
                      </h3>

                      <div className="d-flex flex-column gap-4">

                        <CampoSelect
                          label="Reflexo pupilar direto — OD"
                          name="reflexoPupilarDiretoOD"
                          value={
                            exame.reflexo_pupilar_direto_od
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "reflexo_pupilar_direto_od",
                              valor
                            )
                          }
                          options={[
                            "Presente",
                            "Ausente",
                            "Reduzido",
                            "Alterado",
                          ]}
                        />

                        <CampoSelect
                          label="Reflexo pupilar consensual — OD"
                          name="reflexoConsensualOD"
                          value={
                            exame.reflexo_pupilar_consensual_od
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "reflexo_pupilar_consensual_od",
                              valor
                            )
                          }
                          options={[
                            "Presente",
                            "Ausente",
                            "Reduzido",
                            "Alterado",
                          ]}
                        />

                        <CampoSelect
                          label="Teste de ameaça — OD"
                          name="ameacaOD"
                          value={
                            exame.teste_ameaca_od
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "teste_ameaca_od",
                              valor
                            )
                          }
                          options={[
                            "Presente",
                            "Ausente",
                            "Reduzido",
                            "Alterado",
                          ]}
                        />

                      </div>

                    </div>

                    {/* =================================================
                        TICKET: TESTES OFTALMOLÓGICOS — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Testes oftalmológicos
                      </h3>

                      <div className="d-flex flex-column gap-4">

                        <CampoTexto
                          label="Schirmer — OD"
                          name="schirmerOD"
                          placeholder="mm/min"
                          value={exame.schirmer_od}
                          onChange={(valor) =>
                            alterarExame(
                              "schirmer_od",
                              valor
                            )
                          }
                        />

                        <CampoTexto
                          label="Pressão intraocular — OD"
                          name="pressaoOD"
                          placeholder="mmHg"
                          value={
                            exame.pressao_intraocular_od
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "pressao_intraocular_od",
                              valor
                            )
                          }
                        />

                        <CampoSelect
                          label="Fluoresceína — OD"
                          name="fluoresceinaOD"
                          value={
                            exame.fluoresceina_od
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "fluoresceina_od",
                              valor
                            )
                          }
                          options={[
                            "Negativa",
                            "Positiva",
                            "Não realizado",
                          ]}
                        />

                        <CampoSelect
                          label="Teste de Jones — OD"
                          name="jonesOD"
                          value={
                            exame.teste_jones_od
                          }
                          onChange={(valor) =>
                            alterarExame(
                              "teste_jones_od",
                              valor
                            )
                          }
                          options={[
                            "Positivo",
                            "Negativo",
                            "Não realizado",
                          ]}
                        />

                      </div>

                    </div>

                    {/* =================================================
                        TICKET: PÁLPEBRAS — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Pálpebras
                      </h3>

                      <CampoSelect
                        label="Pálpebra — OD"
                        name="palpebraOD"
                        value={exame.palpebra_od}
                        onChange={(valor) =>
                          alterarExame(
                            "palpebra_od",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Alterada",
                          "Não avaliada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: SECREÇÃO OCULAR — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Secreção ocular
                      </h3>

                      <CampoSelect
                        label="Secreção — OD"
                        name="secrecaoOD"
                        value={exame.secrecao_od}
                        onChange={(valor) =>
                          alterarExame(
                            "secrecao_od",
                            valor
                          )
                        }
                        options={[
                          "Ausente",
                          "Serosa",
                          "Mucosa",
                          "Purulenta",
                          "Hemorrágica",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: CONJUNTIVA — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Conjuntiva
                      </h3>

                      <CampoSelect
                        label="Conjuntiva — OD"
                        name="conjuntivaOD"
                        value={exame.conjuntiva_od}
                        onChange={(valor) =>
                          alterarExame(
                            "conjuntiva_od",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Hiperêmica",
                          "Edemaciada",
                          "Alterada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: CÓRNEA — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Córnea
                      </h3>

                      <CampoSelect
                        label="Córnea — OD"
                        name="corneaOD"
                        value={exame.cornea_od}
                        onChange={(valor) =>
                          alterarExame(
                            "cornea_od",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Edema",
                          "Opacidade",
                          "Úlcera",
                          "Lesão",
                          "Alterada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: CÂMARA ANTERIOR — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Câmara anterior
                      </h3>

                      <CampoSelect
                        label="Câmara anterior — OD"
                        name="camaraOD"
                        value={
                          exame.camara_anterior_od
                        }
                        onChange={(valor) =>
                          alterarExame(
                            "camara_anterior_od",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Alterada",
                          "Não avaliada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: ÍRIS — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Íris
                      </h3>

                      <CampoSelect
                        label="Íris — OD"
                        name="irisOD"
                        value={exame.iris_od}
                        onChange={(valor) =>
                          alterarExame(
                            "iris_od",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Alterada",
                          "Não avaliada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: PUPILA — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Pupila
                      </h3>

                      <CampoSelect
                        label="Pupila — OD"
                        name="pupilaOD"
                        value={exame.pupila_od}
                        onChange={(valor) =>
                          alterarExame(
                            "pupila_od",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Miótica",
                          "Midriática",
                          "Anisocoria",
                          "Alterada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: LENTE — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Lente
                      </h3>

                      <CampoSelect
                        label="Lente — OD"
                        name="lenteOD"
                        value={exame.lente_od}
                        onChange={(valor) =>
                          alterarExame(
                            "lente_od",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Catarata",
                          "Luxação",
                          "Opacidade",
                          "Alterada",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: FUNDO DE OLHO — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Fundo de olho
                      </h3>

                      <CampoSelect
                        label="Fundo de olho — OD"
                        name="fundoOD"
                        value={exame.fundo_olho_od}
                        onChange={(valor) =>
                          alterarExame(
                            "fundo_olho_od",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Alterado",
                          "Não visualizado",
                          "Não avaliado",
                        ]}
                      />

                    </div>

                    {/* =================================================
                        TICKET: VÍTREO — OD
                    ================================================= */}

                    <div style={styles.eyeSection}>

                      <h3 style={styles.eyeSectionTitle}>
                        Vítreo
                      </h3>

                      <CampoSelect
                        label="Vítreo — OD"
                        name="vitreoOD"
                        value={exame.vitreo_od}
                        onChange={(valor) =>
                          alterarExame(
                            "vitreo_od",
                            valor
                          )
                        }
                        options={[
                          "Normal",
                          "Alterado",
                          "Não visualizado",
                          "Não avaliado",
                        ]}
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
              TICKET: DIAGNÓSTICO
          ===================================================== */}

          <div
            className="card border-0"
            style={styles.card}
          >

            <div className="card-body p-4">

              <h2 style={styles.sectionTitle}>
                Diagnóstico
              </h2>

              <div style={styles.fieldSpacing} />

              <textarea
                style={styles.textarea}
                rows={4}
                placeholder="Informe o diagnóstico ou suspeita diagnóstica..."
                value={diagnostico}
                onChange={(event) =>
                  setDiagnostico(event.target.value)
                }
              />

              <div style={styles.fieldSpacing} />

              <label style={styles.label}>
                Observações do diagnóstico
              </label>

              <textarea
                style={styles.textarea}
                rows={4}
                placeholder="Registre informações complementares relacionadas ao diagnóstico..."
                value={observacoesDiagnostico}
                onChange={(event) =>
                  setObservacoesDiagnostico(
                    event.target.value
                  )
                }
              />

            </div>

          </div>

          {/* =====================================================
              TICKET: TRATAMENTO
          ===================================================== */}

          <div
            className="card border-0"
            style={styles.card}
          >

            <div className="card-body p-4">

              <h2 style={styles.sectionTitle}>
                Tratamento
              </h2>

              <div style={styles.fieldSpacing} />

              <textarea
                style={styles.textarea}
                rows={5}
                placeholder="Registre medicamentos, posologia, orientações e demais condutas..."
                value={tratamento}
                onChange={(event) =>
                  setTratamento(event.target.value)
                }
              />

            </div>

          </div>

          {/* =====================================================
              TICKET: FOTOGRAFIAS
          ===================================================== */}

          <div
            className="card border-0"
            style={styles.card}
          >

            <div className="card-body p-4">

              <h2 style={styles.sectionTitle}>
                Fotografias
              </h2>

              <p style={styles.descriptionSection}>
                As fotografias serão vinculadas à consulta e poderão ser
                utilizadas posteriormente para comparação entre atendimentos.
              </p>

              <div className="row g-4">

                {/* =================================================
                    TICKET: FOTOGRAFIA — OE
                ================================================= */}

                <div className="col-12 col-md-6">

                  <div style={styles.photoBox}>

                    <div style={styles.photoTitle}>
                      OE — Olho Esquerdo
                    </div>

                    <button
                      type="button"
                      style={styles.photoButton}
                    >
                      Adicionar foto
                    </button>

                  </div>

                </div>

                {/* =================================================
                    TICKET: FOTOGRAFIA — OD
                ================================================= */}

                <div className="col-12 col-md-6">

                  <div style={styles.photoBox}>

                    <div style={styles.photoTitle}>
                      OD — Olho Direito
                    </div>

                    <button
                      type="button"
                      style={styles.photoButton}
                    >
                      Adicionar foto
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
              TICKET: AÇÕES
          ===================================================== */}

          <div style={styles.actions}>

            <button
              type="button"
              style={styles.pdfButton}
              onClick={gerarRelatorioPDF}
            >
              Gerar relatório PDF
            </button>

            <button
              type="button"
              style={styles.cancelButton}
              onClick={() =>
                navegar(`/paciente/${pacienteId}`)
              }
            >
              Cancelar
            </button>

            <button
              type="button"
              style={styles.saveButton}
              onClick={salvarConsulta}
            >
              Salvar consulta
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

// =========================================================
// TICKET: COMPONENTE CAMPO DE TEXTO
// =========================================================

interface CampoTextoProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (valor: string) => void;
}

function CampoTexto({
  label,
  name,
  placeholder,
  value,
  onChange,
}: CampoTextoProps) {
  return (
    <div>

      <label
        htmlFor={name}
        style={styles.label}
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={styles.input}
      />

    </div>
  );
}

// =========================================================
// TICKET: COMPONENTE CAMPO DE SELEÇÃO
// =========================================================

interface CampoSelectProps {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (valor: string) => void;
}

function CampoSelect({
  label,
  name,
  options,
  value,
  onChange,
}: CampoSelectProps) {
  return (
    <div>

      <label
        htmlFor={name}
        style={styles.label}
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={styles.input}
      >

        <option value="">
          Selecione...
        </option>

        {options.map((opcao) => (
          <option
            key={opcao}
            value={opcao}
          >
            {opcao}
          </option>
        ))}

      </select>

    </div>
  );
}

// =========================================================
// TICKET: ESTILOS
// =========================================================

const styles: Record<string, React.CSSProperties> = {

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

  header: {
    marginBottom: "24px",
  },

  title: {
    margin: "0",
    color: "#111827",
    fontSize: "30px",
    fontWeight: "700",
  },

  description: {
    margin: "7px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  descriptionSection: {
    margin: "6px 0 20px 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  card: {
    marginBottom: "20px",
    borderRadius: "14px",
    boxShadow: "0 5px 20px rgba(0, 0, 0, 0.05)",
  },

  sectionTitle: {
    margin: "0",
    color: "#111827",
    fontSize: "18px",
    fontWeight: "600",
  },

  // =========================================================
  // TICKET: CAIXA INDIVIDUAL DE CADA OLHO
  // =========================================================

  eyeCard: {
    height: "100%",
    padding: "22px",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    boxShadow: "0 3px 12px rgba(0, 0, 0, 0.04)",
  },

  // =========================================================
  // TICKET: TÍTULO DO OLHO
  // =========================================================

  eyeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    marginBottom: "24px",
    padding: "10px 14px",
    backgroundColor: "#f1f3f5",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "0.3px",
    textAlign: "center",
  },

  // =========================================================
  // TICKET: SEÇÕES DENTRO DA CAIXA DO OLHO
  // =========================================================

  eyeSection: {
    marginTop: "26px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  },

  eyeSectionTitle: {
    margin: "0 0 18px 0",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#374151",
    fontSize: "13px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    minHeight: "42px",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  fieldSpacing: {
    height: "20px",
  },

  // =========================================================
  // TICKET: FOTOGRAFIAS
  // =========================================================

  photoBox: {
    minHeight: "150px",
    padding: "24px",
    backgroundColor: "#f8fafc",
    border: "1px dashed #d1d5db",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  },

  photoTitle: {
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },

  photoButton: {
    padding: "9px 15px",
    backgroundColor: "#ffffff",
    color: "#4a4b4d",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  // =========================================================
  // TICKET: AÇÕES
  // =========================================================

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    paddingBottom: "30px",
  },

  pdfButton: {
    marginRight: "auto",
    padding: "11px 18px",
    backgroundColor: "#ffffff",
    color: "#4a4b4d",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  cancelButton: {
    padding: "11px 18px",
    backgroundColor: "#ffffff",
    color: "#4a4b4d",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  saveButton: {
    padding: "11px 20px",
    backgroundColor: "#4a4b4d",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default Consulta;