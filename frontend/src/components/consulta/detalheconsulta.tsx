// ============================================
// SOV - DETALHE DA CONSULTA
// Exibe as informações de uma consulta específica,
// o exame oftalmológico realizado e permite anexar
// e visualizar fotos dos olhos da consulta.
// ============================================

import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import jsPDF from "jspdf";


// ============================================
// INTERFACE DA CONSULTA
// ============================================

interface Consulta {
  id: number;
  paciente_id: number;
  veterinario_id: number;
  data_consulta: string;
  motivo: string;
  diagnostico: string;
  observacoes: string;
  nome_animal: string;
  nome_tutor: string;
}


// ============================================
// INTERFACE DO EXAME OFTALMOLÓGICO
// ============================================

interface ExameOftalmologico {
  id: number;
  consulta_id: number;

  // ------------------------------------------
  // OD - OLHO DIREITO
  // ------------------------------------------

  reflexo_pupilar_direto_od: string | null;
  reflexo_pupilar_consensual_od: string | null;
  teste_ameaca_od: string | null;
  schirmer_od: string | null;
  pressao_intraocular_od: string | null;
  fluoresceina_od: string | null;
  teste_jones_od: string | null;
  palpebra_od: string | null;
  secrecao_od: string | null;
  conjuntiva_od: string | null;
  cornea_od: string | null;
  camara_anterior_od: string | null;
  iris_od: string | null;
  pupila_od: string | null;
  lente_od: string | null;
  fundo_olho_od: string | null;
  vitreo_od: string | null;

  // ------------------------------------------
  // OE - OLHO ESQUERDO
  // ------------------------------------------

  reflexo_pupilar_direto_oe: string | null;
  reflexo_pupilar_consensual_oe: string | null;
  teste_ameaca_oe: string | null;
  schirmer_oe: string | null;
  pressao_intraocular_oe: string | null;
  fluoresceina_oe: string | null;
  teste_jones_oe: string | null;
  palpebra_oe: string | null;
  secrecao_oe: string | null;
  conjuntiva_oe: string | null;
  cornea_oe: string | null;
  camara_anterior_oe: string | null;
  iris_oe: string | null;
  pupila_oe: string | null;
  lente_oe: string | null;
  fundo_olho_oe: string | null;
  vitreo_oe: string | null;
}


// ============================================
// INTERFACE DAS FOTOS DA CONSULTA
// ============================================

interface FotoConsulta {
  id: number;
  consulta_id: number;
  olho: "OD" | "OE";
  nome_arquivo: string;
  tipo_arquivo: string;
  tamanho_arquivo: number;
  criado_em: string;
}


// ============================================
// COMPONENTE
// ============================================

const DetalheConsulta: React.FC = () => {

  const { id } =
    useParams<{ id: string }>();

  const navigate =
    useNavigate();


  // ==========================================
  // ESTADOS DA CONSULTA
  // ==========================================

  const [consulta, setConsulta] =
    useState<Consulta | null>(null);

  const [exame, setExame] =
    useState<ExameOftalmologico | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");


  // ==========================================
  // ESTADOS DAS FOTOS
  // ==========================================

  const [fotos, setFotos] =
    useState<FotoConsulta[]>([]);

  const [carregandoFotos, setCarregandoFotos] =
    useState(true);


  // ==========================================
  // ESTADOS DO UPLOAD
  // ==========================================

  const [foto, setFoto] =
    useState<File | null>(null);

  const [olho, setOlho] =
    useState<"OD" | "OE">("OD");

  const [enviandoFoto, setEnviandoFoto] =
    useState(false);

  const [mensagemFoto, setMensagemFoto] =
    useState("");

  const [erroFoto, setErroFoto] =
    useState("");


  // ============================================
  // FUNÇÃO - LIMPAR SESSÃO
  // ============================================

  const encerrarSessao = () => {

    localStorage.removeItem("token");

    localStorage.removeItem(
      "veterinario"
    );

    navigate("/");

  };


  // ============================================
  // BUSCAR CONSULTA + EXAME
  // ============================================

  useEffect(() => {

    const buscarDados = async () => {

      try {

        const token =
          localStorage.getItem("token");


        // ----------------------------------------
        // VALIDAR TOKEN
        // ----------------------------------------

        if (!token) {

          navigate("/");

          return;

        }


        // ----------------------------------------
        // BUSCAR CONSULTA
        // ----------------------------------------

        const respostaConsulta =
          await fetch(
            `http://localhost:3333/consultas/${id}`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );


        // ----------------------------------------
        // TOKEN INVÁLIDO
        // ----------------------------------------

        if (
          respostaConsulta.status === 401
        ) {

          encerrarSessao();

          return;

        }


        // ----------------------------------------
        // CONSULTA NÃO ENCONTRADA
        // ----------------------------------------

        if (
          respostaConsulta.status === 404
        ) {

          setErro(
            "Consulta não encontrada."
          );

          return;

        }


        if (!respostaConsulta.ok) {

          throw new Error(
            "Erro ao buscar consulta."
          );

        }


        const dadosConsulta =
          await respostaConsulta.json();


        setConsulta(dadosConsulta);


        // ----------------------------------------
        // BUSCAR EXAME OFTALMOLÓGICO
        // ----------------------------------------

        const respostaExame =
          await fetch(
            `http://localhost:3333/exames-oftalmologicos/consulta/${id}`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );


        // ----------------------------------------
        // TOKEN INVÁLIDO
        // ----------------------------------------

        if (
          respostaExame.status === 401
        ) {

          encerrarSessao();

          return;

        }


        // ----------------------------------------
        // EXAME NÃO ENCONTRADO
        //
        // Consultas antigas podem não possuir
        // exame oftalmológico.
        // ----------------------------------------

        if (
          respostaExame.status === 404
        ) {

          setExame(null);

        } else if (!respostaExame.ok) {

          throw new Error(
            "Erro ao buscar exame oftalmológico."
          );

        } else {

          const dadosExame =
            await respostaExame.json();

          setExame(dadosExame);

        }

      } catch (error) {

        console.error(
          "Erro ao buscar dados da consulta:",
          error
        );

        setErro(
          "Não foi possível carregar os dados da consulta."
        );

      } finally {

        setCarregando(false);

      }

    };


    if (id) {

      buscarDados();

    }

  }, [id, navigate]);


  // ============================================
  // BUSCAR FOTOS DA CONSULTA
  // ============================================

  useEffect(() => {

    const buscarFotos = async () => {

      if (!id) {
        return;
      }


      try {

        const token =
          localStorage.getItem("token");


        if (!token) {

          navigate("/");

          return;

        }


        const resposta =
          await fetch(
            `http://localhost:3333/consultas/${id}/fotos`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        // ----------------------------------------
        // TOKEN INVÁLIDO
        // ----------------------------------------

        if (
          resposta.status === 401
        ) {

          encerrarSessao();

          return;

        }


        if (!resposta.ok) {

          throw new Error(
            "Erro ao buscar fotos da consulta."
          );

        }


        const dados =
          await resposta.json();


        setFotos(dados);

      } catch (error) {

        console.error(
          "Erro ao buscar fotos:",
          error
        );

      } finally {

        setCarregandoFotos(false);

      }

    };


    buscarFotos();

  }, [id, navigate]);


  // ============================================
  // SELECIONAR FOTO
  // ============================================

  const selecionarFoto = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    setMensagemFoto("");

    setErroFoto("");


    const arquivo =
      event.target.files?.[0];


    if (!arquivo) {

      setFoto(null);

      return;

    }


    // ------------------------------------------
    // TIPOS PERMITIDOS
    // ------------------------------------------

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];


    if (
      !tiposPermitidos.includes(
        arquivo.type
      )
    ) {

      setFoto(null);

      setErroFoto(
        "Formato não permitido. Selecione uma imagem JPG, PNG ou WEBP."
      );

      event.target.value = "";

      return;

    }


    // ------------------------------------------
    // TAMANHO MÁXIMO
    // ------------------------------------------

    const tamanhoMaximo =
      5 * 1024 * 1024;


    if (
      arquivo.size > tamanhoMaximo
    ) {

      setFoto(null);

      setErroFoto(
        "A foto não pode ultrapassar 5 MB."
      );

      event.target.value = "";

      return;

    }


    setFoto(arquivo);

  };


  // ============================================
  // ENVIAR FOTO
  // ============================================

  const enviarFoto = async () => {

    setMensagemFoto("");

    setErroFoto("");


    // ------------------------------------------
    // VALIDAR CONSULTA
    // ------------------------------------------

    if (!id) {

      setErroFoto(
        "Consulta inválida."
      );

      return;

    }


    // ------------------------------------------
    // VALIDAR FOTO
    // ------------------------------------------

    if (!foto) {

      setErroFoto(
        "Selecione uma foto antes de enviar."
      );

      return;

    }


    // ------------------------------------------
    // TOKEN
    // ------------------------------------------

    const token =
      localStorage.getItem("token");


    if (!token) {

      navigate("/");

      return;

    }


    try {

      setEnviandoFoto(true);


      // ----------------------------------------
      // FORMDATA
      //
      // FormData permite enviar o arquivo junto
      // com os demais dados da requisição.
      // ----------------------------------------

      const formulario =
        new FormData();


      formulario.append(
        "olho",
        olho
      );


      formulario.append(
        "foto",
        foto
      );


      // ----------------------------------------
      // ENVIAR PARA O BACKEND
      // ----------------------------------------

      const resposta =
        await fetch(
          `http://localhost:3333/consultas/${id}/fotos`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: formulario,
          }
        );


      // ----------------------------------------
      // TOKEN INVÁLIDO
      // ----------------------------------------

      if (
        resposta.status === 401
      ) {

        encerrarSessao();

        return;

      }


      // ----------------------------------------
      // LER RESPOSTA
      // ----------------------------------------

      const dados =
        await resposta.json();


      // ----------------------------------------
      // ERRO DO BACKEND
      // ----------------------------------------

      if (!resposta.ok) {

        setErroFoto(
          dados.mensagem ||
          "Não foi possível enviar a foto."
        );

        return;

      }


      // ----------------------------------------
      // SUCESSO
      // ----------------------------------------

      setMensagemFoto(
        "Foto enviada com sucesso."
      );


      setFoto(null);


      // ----------------------------------------
      // LIMPAR INPUT
      // ----------------------------------------

      const input =
        document.getElementById(
          "foto-consulta"
        ) as HTMLInputElement | null;


      if (input) {

        input.value = "";

      }


      // ----------------------------------------
      // ATUALIZAR GALERIA
      // ----------------------------------------

      const respostaFotos =
        await fetch(
          `http://localhost:3333/consultas/${id}/fotos`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      if (
        respostaFotos.status === 401
      ) {

        encerrarSessao();

        return;

      }


      if (respostaFotos.ok) {

        const novasFotos =
          await respostaFotos.json();

        setFotos(novasFotos);

      }

    } catch (error) {

      console.error(
        "Erro ao enviar foto:",
        error
      );


      setErroFoto(
        "Não foi possível enviar a foto."
      );

    } finally {

      setEnviandoFoto(false);

    }

  };


  // ============================================
  // GERAR RELATÓRIO PDF
  // Somente informações essenciais
  // ============================================

  const gerarRelatorio = () => {

    if (!consulta) {
      return;
    }


    const pdf =
      new jsPDF();


    let y = 20;


    // ------------------------------------------
    // FUNÇÃO PARA VERIFICAR ESPAÇO
    // ------------------------------------------

    const verificarPagina = (
      espacoNecessario: number = 10
    ) => {

      if (
        y + espacoNecessario > 275
      ) {

        pdf.addPage();

        y = 20;

      }

    };


    // ------------------------------------------
    // FUNÇÃO PARA ADICIONAR CAMPO
    // ------------------------------------------

    const adicionarCampo = (
      titulo: string,
      valor: string
    ) => {

      verificarPagina(15);


      pdf.setFontSize(10);

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.text(
        titulo,
        20,
        y
      );


      y += 6;


      pdf.setFont(
        "helvetica",
        "normal"
      );


      const linhas =
        pdf.splitTextToSize(
          valor || "Não informado.",
          170
        );


      pdf.text(
        linhas,
        20,
        y
      );


      y +=
        linhas.length * 5 +
        8;

    };


    // ------------------------------------------
    // CABEÇALHO
    // ------------------------------------------

    pdf.setFontSize(20);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.text(
      "S.O.V",
      20,
      y
    );


    y += 7;


    pdf.setFontSize(10);

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.text(
      "Serviço de Oftalmologia Veterinária",
      20,
      y
    );


    y += 8;


    pdf.line(
      20,
      y,
      190,
      y
    );


    y += 12;


    // ------------------------------------------
    // TÍTULO
    // ------------------------------------------

    pdf.setFontSize(16);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.text(
      "Relatório da Consulta",
      20,
      y
    );


    y += 12;


    // ------------------------------------------
    // IDENTIFICAÇÃO
    // ------------------------------------------

    pdf.setFontSize(13);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.text(
      "Identificação",
      20,
      y
    );


    y += 9;


    adicionarCampo(
      "Paciente:",
      consulta.nome_animal
    );


    adicionarCampo(
      "Tutor:",
      consulta.nome_tutor
    );


    adicionarCampo(
      "Data:",
      dataFormatada
    );


    adicionarCampo(
      "Horário:",
      horarioFormatado
    );


    // ------------------------------------------
    // MOTIVO
    // ------------------------------------------

    pdf.setFontSize(13);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.text(
      "Motivo da consulta",
      20,
      y
    );


    y += 9;


    adicionarCampo(
      "",
      consulta.motivo
    );


    // ------------------------------------------
    // DIAGNÓSTICO
    // ------------------------------------------

    pdf.setFontSize(13);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.text(
      "Diagnóstico",
      20,
      y
    );


    y += 9;


    adicionarCampo(
      "",
      consulta.diagnostico
    );


    // ------------------------------------------
    // OBSERVAÇÕES
    // ------------------------------------------

    pdf.setFontSize(13);

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.text(
      "Observações",
      20,
      y
    );


    y += 9;


    adicionarCampo(
      "",
      consulta.observacoes
    );


    // ------------------------------------------
    // EXAME OFTALMOLÓGICO
    //
    // Não são incluídos os parâmetros técnicos.
    // ------------------------------------------

    if (exame) {

      verificarPagina(25);


      pdf.setFontSize(13);

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.text(
        "Exame oftalmológico",
        20,
        y
      );


      y += 9;


      pdf.setFontSize(10);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.text(
        "Exame oftalmológico realizado nesta consulta.",
        20,
        y
      );


      y += 10;

    }


    // ------------------------------------------
    // RODAPÉ
    // ------------------------------------------

    verificarPagina(15);


    y += 5;


    pdf.setFontSize(8);

    pdf.setFont(
      "helvetica",
      "normal"
    );


    const dataGeracao =
      new Date().toLocaleDateString(
        "pt-BR"
      );


    pdf.text(
      `Relatório gerado em ${dataGeracao}`,
      20,
      y
    );


    y += 5;


    pdf.text(
      "S.O.V - Serviço de Oftalmologia Veterinária",
      20,
      y
    );


    // ------------------------------------------
    // SALVAR PDF
    // ------------------------------------------

    pdf.save(
      `relatorio-${consulta.nome_animal
        .replace(/\s+/g, "-")
        .toLowerCase()}-${consulta.id}.pdf`
    );

  };


  // ============================================
  // ESTADO: CARREGANDO
  // ============================================

  if (carregando) {

    return (

      <div className="container-fluid p-4">

        <p>
          Carregando consulta...
        </p>

      </div>

    );

  }


  // ============================================
  // ESTADO: ERRO
  // ============================================

  if (erro) {

    return (

      <div className="container-fluid p-4">

        <button
          className="btn btn-secondary mb-3"
          onClick={() =>
            navigate("/consultas")
          }
        >
          ← Voltar
        </button>


        <div className="alert alert-danger">

          {erro}

        </div>

      </div>

    );

  }


  // ============================================
  // SEGURANÇA
  // ============================================

  if (!consulta) {

    return (

      <div className="container-fluid p-4">

        <p>
          Consulta não encontrada.
        </p>

      </div>

    );

  }


  // ============================================
  // FORMATAÇÃO DA DATA E HORÁRIO
  // ============================================

  const dataConsulta =
    new Date(
      consulta.data_consulta
    );


  const dataFormatada =
    dataConsulta.toLocaleDateString(
      "pt-BR"
    );


  const horarioFormatado =
    dataConsulta.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );


  // ============================================
  // FUNÇÃO PARA EXIBIR VALORES DO EXAME
  // ============================================

  const valorExame = (
    valor: string | null
  ) => {

    return valor ||
      "Não informado.";

  };


  // ============================================
  // SEPARAR FOTOS POR OLHO
  // ============================================

  const fotosOD =
    fotos.filter(
      (foto) =>
        foto.olho === "OD"
    );


  const fotosOE =
    fotos.filter(
      (foto) =>
        foto.olho === "OE"
    );


  // ============================================
  // TELA
  // ============================================

  return (

    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >


      {/* ========================================
          CABEÇALHO
      ======================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="mb-1">
            Detalhes da Consulta
          </h2>

          <p className="text-muted mb-0">
            Consulta #{consulta.id}
          </p>

        </div>


        <button
          className="btn btn-secondary"
          onClick={() =>
            navigate("/consultas")
          }
        >
          ← Voltar
        </button>

      </div>


      {/* ========================================
          IDENTIFICAÇÃO
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="card-title mb-4">
            Identificação
          </h5>


          <div className="row">

            <div className="col-md-6 mb-3">

              <strong>
                Paciente
              </strong>

              <div className="text-muted">
                {consulta.nome_animal}
              </div>

            </div>


            <div className="col-md-6 mb-3">

              <strong>
                Tutor
              </strong>

              <div className="text-muted">
                {consulta.nome_tutor}
              </div>

            </div>


            <div className="col-md-6 mb-3">

              <strong>
                Data da consulta
              </strong>

              <div className="text-muted">
                {dataFormatada}
              </div>

            </div>


            <div className="col-md-6 mb-3">

              <strong>
                Horário da consulta
              </strong>

              <div className="text-muted">
                {horarioFormatado}
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ========================================
          ANAMNESE / MOTIVO
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="card-title mb-3">
            Anamnese / Motivo da consulta
          </h5>


          <div className="p-3 bg-light rounded">

            {consulta.motivo ||
              "Não informado."}

          </div>

        </div>

      </div>


      {/* ========================================
          DIAGNÓSTICO
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="card-title mb-3">
            Diagnóstico
          </h5>


          <div className="p-3 bg-light rounded">

            {consulta.diagnostico ||
              "Não informado."}

          </div>

        </div>

      </div>


      {/* ========================================
          OBSERVAÇÕES
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="card-title mb-3">
            Observações
          </h5>


          <div className="p-3 bg-light rounded">

            {consulta.observacoes ||
              "Não informado."}

          </div>

        </div>

      </div>


      {/* ========================================
          FOTOS DA CONSULTA
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="card-title mb-4">
            Fotos da consulta
          </h5>


          {/* ======================================
              UPLOAD
          ====================================== */}

          <div className="row">

            {/* ------------------------------------
                OLHO
            ------------------------------------- */}

            <div className="col-md-4 mb-3">

              <label
                htmlFor="olho-foto"
                className="form-label"
              >
                Olho
              </label>


              <select
                id="olho-foto"
                className="form-select"
                value={olho}
                onChange={(event) =>
                  setOlho(
                    event.target.value as
                      | "OD"
                      | "OE"
                  )
                }
                disabled={enviandoFoto}
              >

                <option value="OD">
                  OD - Olho Direito
                </option>

                <option value="OE">
                  OE - Olho Esquerdo
                </option>

              </select>

            </div>


            {/* ------------------------------------
                ARQUIVO
            ------------------------------------- */}

            <div className="col-md-8 mb-3">

              <label
                htmlFor="foto-consulta"
                className="form-label"
              >
                Foto
              </label>


              <input
                id="foto-consulta"
                type="file"
                className="form-control"
                accept="image/jpeg,image/png,image/webp"
                onChange={selecionarFoto}
                disabled={enviandoFoto}
              />


              <div className="form-text">
                JPG, PNG ou WEBP — máximo de 5 MB.
              </div>

            </div>

          </div>


          {/* ======================================
              ARQUIVO SELECIONADO
          ====================================== */}

          {foto && (

            <div className="alert alert-secondary">

              <strong>
                Arquivo selecionado:
              </strong>{" "}

              {foto.name}

              <br />

              <strong>
                Olho:
              </strong>{" "}

              {olho}

            </div>

          )}


          {/* ======================================
              ERRO
          ====================================== */}

          {erroFoto && (

            <div className="alert alert-danger">

              {erroFoto}

            </div>

          )}


          {/* ======================================
              SUCESSO
          ====================================== */}

          {mensagemFoto && (

            <div className="alert alert-success">

              {mensagemFoto}

            </div>

          )}


          {/* ======================================
              BOTÃO ENVIAR
          ====================================== */}

          <button
            type="button"
            className="btn btn-primary"
            onClick={enviarFoto}
            disabled={
              enviandoFoto ||
              !foto
            }
          >

            {enviandoFoto
              ? "Enviando..."
              : "Enviar foto"}

          </button>


          {/* ======================================
              GALERIA
          ====================================== */}

          <hr className="my-4" />


          <h6 className="mb-4">
            Fotos anexadas
          </h6>


          {carregandoFotos ? (

            <p className="text-muted">
              Carregando fotos...
            </p>

          ) : fotos.length === 0 ? (

            <div className="alert alert-light border mb-0">

              Nenhuma foto foi anexada
              a esta consulta.

            </div>

          ) : (

            <div className="row">


              {/* ==================================
                  OD
              ================================== */}

              <div className="col-md-6 mb-4">

                <div className="card h-100 border">

                  <div className="card-body">

                    <h6 className="mb-3">
                      Olho Direito (OD)
                    </h6>


                    {fotosOD.length === 0 ? (

                      <p className="text-muted mb-0">

                        Nenhuma foto do
                        olho direito.

                      </p>

                    ) : (

                      <div className="row">

                        {fotosOD.map(
                          (foto) => (

                            <div
                              key={foto.id}
                              className="col-sm-6 mb-3"
                            >

                              <div className="card border">

                                <img
                                  src={`http://localhost:3333/fotos/${foto.id}`}
                                  alt={`Foto do olho direito - ${foto.nome_arquivo}`}
                                  className="card-img-top"
                                  style={{
                                    height:
                                      "220px",
                                    objectFit:
                                      "cover",
                                  }}
                                />

                                <div className="card-body p-2">

                                  <small
                                    className="text-muted d-block"
                                    style={{
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {foto.nome_arquivo}
                                  </small>

                                </div>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </div>

              </div>


              {/* ==================================
                  OE
              ================================== */}

              <div className="col-md-6 mb-4">

                <div className="card h-100 border">

                  <div className="card-body">

                    <h6 className="mb-3">
                      Olho Esquerdo (OE)
                    </h6>


                    {fotosOE.length === 0 ? (

                      <p className="text-muted mb-0">

                        Nenhuma foto do
                        olho esquerdo.

                      </p>

                    ) : (

                      <div className="row">

                        {fotosOE.map(
                          (foto) => (

                            <div
                              key={foto.id}
                              className="col-sm-6 mb-3"
                            >

                              <div className="card border">

                                <img
                                  src={`http://localhost:3333/fotos/${foto.id}`}
                                  alt={`Foto do olho esquerdo - ${foto.nome_arquivo}`}
                                  className="card-img-top"
                                  style={{
                                    height:
                                      "220px",
                                    objectFit:
                                      "cover",
                                  }}
                                />

                                <div className="card-body p-2">

                                  <small
                                    className="text-muted d-block"
                                    style={{
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {foto.nome_arquivo}
                                  </small>

                                </div>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* ========================================
          EXAME OFTALMOLÓGICO
      ======================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="card-title mb-4">
            Exame Oftalmológico
          </h5>


          {/* ======================================
              SEM EXAME
          ====================================== */}

          {!exame && (

            <div className="alert alert-secondary mb-0">

              Nenhum exame oftalmológico foi
              registrado para esta consulta.

            </div>

          )}


          {/* ======================================
              EXAME EXISTENTE
          ====================================== */}

          {exame && (

            <div className="row">


              {/* ==================================
                  OLHO DIREITO - OD
              ================================== */}

              <div className="col-md-6 mb-4">

                <div className="card h-100 border">

                  <div className="card-body">

                    <h5 className="mb-4">
                      Olho Direito (OD)
                    </h5>


                    <div className="mb-3">

                      <strong>
                        Reflexo pupilar direto
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.reflexo_pupilar_direto_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Reflexo pupilar consensual
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.reflexo_pupilar_consensual_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Teste de ameaça
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.teste_ameaca_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Schirmer
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.schirmer_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Pressão intraocular
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.pressao_intraocular_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Fluoresceína
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.fluoresceina_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Teste de Jones
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.teste_jones_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Pálpebra
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.palpebra_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Secreção
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.secrecao_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Conjuntiva
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.conjuntiva_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Córnea
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.cornea_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Câmara anterior
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.camara_anterior_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Íris
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.iris_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Pupila
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.pupila_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Lente
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.lente_od
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Fundo do olho
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.fundo_olho_od
                        )}

                      </div>

                    </div>


                    <div>

                      <strong>
                        Vítreo
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.vitreo_od
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              </div>


              {/* ==================================
                  OLHO ESQUERDO - OE
              ================================== */}

              <div className="col-md-6 mb-4">

                <div className="card h-100 border">

                  <div className="card-body">

                    <h5 className="mb-4">
                      Olho Esquerdo (OE)
                    </h5>


                    <div className="mb-3">

                      <strong>
                        Reflexo pupilar direto
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.reflexo_pupilar_direto_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Reflexo pupilar consensual
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.reflexo_pupilar_consensual_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Teste de ameaça
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.teste_ameaca_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Schirmer
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.schirmer_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Pressão intraocular
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.pressao_intraocular_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Fluoresceína
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.fluoresceina_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Teste de Jones
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.teste_jones_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Pálpebra
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.palpebra_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Secreção
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.secrecao_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Conjuntiva
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.conjuntiva_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Córnea
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.cornea_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Câmara anterior
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.camara_anterior_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Íris
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.iris_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Pupila
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.pupila_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Lente
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.lente_oe
                        )}

                      </div>

                    </div>


                    <div className="mb-3">

                      <strong>
                        Fundo do olho
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.fundo_olho_oe
                        )}

                      </div>

                    </div>


                    <div>

                      <strong>
                        Vítreo
                      </strong>

                      <div className="text-muted">

                        {valorExame(
                          exame.vitreo_oe
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* ========================================
          BOTÕES FINAIS
          Somente os novos botões solicitados
      ======================================== */}

      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() =>
            navigate("/listapaciente")
          }
        >
          ← Voltar aos pacientes
        </button>


        <button
          type="button"
          className="btn btn-primary"
          onClick={gerarRelatorio}
        >
          Gerar relatório
        </button>

      </div>

    </div>

  );

};


export default DetalheConsulta;