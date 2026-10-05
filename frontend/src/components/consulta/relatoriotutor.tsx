import React from "react";

// ============================================================
// INTERFACES
// ============================================================

interface Consulta {
    id: number;
    paciente_id: number;
    data_consulta: string;
    motivo?: string;
    diagnostico?: string;
    observacoes?: string;
}

interface ExameOftalmologico {
    reflexo_pupilar_direto_od?: string;
    reflexo_pupilar_direto_oe?: string;

    reflexo_pupilar_consensual_od?: string;
    reflexo_pupilar_consensual_oe?: string;

    teste_ameaca_od?: string;
    teste_ameaca_oe?: string;

    schirmer_od?: string;
    schirmer_oe?: string;

    pressao_intraocular_od?: string;
    pressao_intraocular_oe?: string;

    fluoresceina_od?: string;
    fluoresceina_oe?: string;

    teste_jones_od?: string;
    teste_jones_oe?: string;

    palpebra_od?: string;
    palpebra_oe?: string;

    secrecao_od?: string;
    secrecao_oe?: string;

    conjuntiva_od?: string;
    conjuntiva_oe?: string;

    cornea_od?: string;
    cornea_oe?: string;

    camara_anterior_od?: string;
    camara_anterior_oe?: string;

    iris_od?: string;
    iris_oe?: string;

    pupila_od?: string;
    pupila_oe?: string;

    lente_od?: string;
    lente_oe?: string;

    fundo_olho_od?: string;
    fundo_olho_oe?: string;

    vitreo_od?: string;
    vitreo_oe?: string;
}

interface RelatorioTutorProps {
    consulta: Consulta;
    exame: ExameOftalmologico | null;
    nomeVeterinario?: string;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const RelatorioTutor: React.FC<RelatorioTutorProps> = ({
    consulta,
    exame,
    nomeVeterinario
}) => {

    // ========================================================
    // FUNÇÃO AUXILIAR
    // ========================================================

    const criarResultado = (
        nome: string,
        valor?: string
    ) => {
        if (!valor || !valor.trim()) {
            return null;
        }

        return {
            nome,
            valor
        };
    };

    // ========================================================
    // RESULTADOS DO OLHO DIREITO
    // ========================================================

    const resultadosOD = exame
        ? [
            criarResultado(
                "Resposta da pupila à luz",
                exame.reflexo_pupilar_direto_od
            ),

            criarResultado(
                "Resposta indireta da pupila à luz",
                exame.reflexo_pupilar_consensual_od
            ),

            criarResultado(
                "Resposta ao teste de ameaça",
                exame.teste_ameaca_od
            ),

            criarResultado(
                "Produção de lágrimas (Teste de Schirmer)",
                exame.schirmer_od
            ),

            criarResultado(
                "Pressão dentro do olho",
                exame.pressao_intraocular_od
            ),

            criarResultado(
                "Teste com fluoresceína",
                exame.fluoresceina_od
            ),

            criarResultado(
                "Avaliação do sistema de drenagem das lágrimas (Teste de Jones)",
                exame.teste_jones_od
            ),

            criarResultado(
                "Pálpebras",
                exame.palpebra_od
            ),

            criarResultado(
                "Secreção ocular",
                exame.secrecao_od
            ),

            criarResultado(
                "Conjuntiva",
                exame.conjuntiva_od
            ),

            criarResultado(
                "Córnea",
                exame.cornea_od
            ),

            criarResultado(
                "Parte frontal interna do olho",
                exame.camara_anterior_od
            ),

            criarResultado(
                "Íris",
                exame.iris_od
            ),

            criarResultado(
                "Pupila",
                exame.pupila_od
            ),

            criarResultado(
                "Lente",
                exame.lente_od
            ),

            criarResultado(
                "Fundo do olho",
                exame.fundo_olho_od
            ),

            criarResultado(
                "Vítreo",
                exame.vitreo_od
            )
        ].filter((resultado) => resultado !== null)
        : [];

    // ========================================================
    // RESULTADOS DO OLHO ESQUERDO
    // ========================================================

    const resultadosOE = exame
        ? [
            criarResultado(
                "Resposta da pupila à luz",
                exame.reflexo_pupilar_direto_oe
            ),

            criarResultado(
                "Resposta indireta da pupila à luz",
                exame.reflexo_pupilar_consensual_oe
            ),

            criarResultado(
                "Resposta ao teste de ameaça",
                exame.teste_ameaca_oe
            ),

            criarResultado(
                "Produção de lágrimas (Teste de Schirmer)",
                exame.schirmer_oe
            ),

            criarResultado(
                "Pressão dentro do olho",
                exame.pressao_intraocular_oe
            ),

            criarResultado(
                "Teste com fluoresceína",
                exame.fluoresceina_oe
            ),

            criarResultado(
                "Avaliação do sistema de drenagem das lágrimas (Teste de Jones)",
                exame.teste_jones_oe
            ),

            criarResultado(
                "Pálpebras",
                exame.palpebra_oe
            ),

            criarResultado(
                "Secreção ocular",
                exame.secrecao_oe
            ),

            criarResultado(
                "Conjuntiva",
                exame.conjuntiva_oe
            ),

            criarResultado(
                "Córnea",
                exame.cornea_oe
            ),

            criarResultado(
                "Parte frontal interna do olho",
                exame.camara_anterior_oe
            ),

            criarResultado(
                "Íris",
                exame.iris_oe
            ),

            criarResultado(
                "Pupila",
                exame.pupila_oe
            ),

            criarResultado(
                "Lente",
                exame.lente_oe
            ),

            criarResultado(
                "Fundo do olho",
                exame.fundo_olho_oe
            ),

            criarResultado(
                "Vítreo",
                exame.vitreo_oe
            )
        ].filter((resultado) => resultado !== null)
        : [];

    // ========================================================
    // DATA DA CONSULTA
    // ========================================================

    const dataFormatada = consulta.data_consulta
        ? new Date(consulta.data_consulta).toLocaleDateString(
            "pt-BR"
        )
        : "Não informada";

    // ========================================================
    // RENDERIZAÇÃO DE UM RESULTADO
    // ========================================================

    const renderResultado = (
        resultado: {
            nome: string;
            valor: string;
        }
    ) => {
        return (
            <div
                key={resultado.nome}
                className="mb-3 p-3 rounded"
                style={{
                    backgroundColor: "#f4f7fb",
                    border: "1px solid #e5e7eb"
                }}
            >
                <div
                    style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#4a4b4d",
                        marginBottom: "4px"
                    }}
                >
                    {resultado.nome}
                </div>

                <div
                    style={{
                        fontSize: "14px",
                        color: "#555"
                    }}
                >
                    {resultado.valor}
                </div>
            </div>
        );
    };

    // ========================================================
    // COMPONENTE
    // ========================================================

    return (
        <div
            className="mt-4 mb-4"
            style={{
                backgroundColor: "#f4f7fb",
                borderRadius: "16px",
                padding: "24px"
            }}
        >

            {/* ==================================================
                CABEÇALHO
            ================================================== */}

            <div
                className="text-center mb-4"
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
            >
                <h2
                    style={{
                        color: "#4a4b4d",
                        fontWeight: 700,
                        marginBottom: "4px"
                    }}
                >
                    S.O.V
                </h2>

                <div
                    style={{
                        color: "#666",
                        fontSize: "14px"
                    }}
                >
                    Serviço de Oftalmologia Veterinária
                </div>

                <h4
                    className="mt-3 mb-0"
                    style={{
                        color: "#4a4b4d",
                        fontWeight: 600
                    }}
                >
                    Relatório de Atendimento
                </h4>

                <div
                    className="mt-2"
                    style={{
                        color: "#777",
                        fontSize: "14px"
                    }}
                >
                    {dataFormatada}
                </div>
            </div>

            {/* ==================================================
                INTRODUÇÃO
            ================================================== */}

            <div
                className="mb-4"
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
            >
                <p
                    className="mb-0"
                    style={{
                        color: "#555",
                        lineHeight: 1.7
                    }}
                >
                    Este relatório apresenta, de forma resumida e
                    acessível, as principais informações registradas
                    durante o atendimento oftalmológico.
                </p>
            </div>

            {/* ==================================================
                DADOS DO PACIENTE
            ================================================== */}

            <div
                className="mb-4"
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
            >
                <h5
                    style={{
                        color: "#4a4b4d",
                        fontWeight: 600,
                        marginBottom: "16px"
                    }}
                >
                    Dados do paciente
                </h5>

                <div className="row">

                    <div className="col-md-4 mb-3">
                        <strong>Paciente</strong>

                        <div className="text-muted">
                            Atendimento registrado
                        </div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <strong>Data da consulta</strong>

                        <div className="text-muted">
                            {dataFormatada}
                        </div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <strong>Consulta</strong>

                        <div className="text-muted">
                            #{consulta.id}
                        </div>
                    </div>

                </div>
            </div>

            {/* ==================================================
                MOTIVO DA CONSULTA
            ================================================== */}

            {consulta.motivo && consulta.motivo.trim() && (
                <div
                    className="mb-4"
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        padding: "20px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                    }}
                >
                    <h5
                        style={{
                            color: "#4a4b4d",
                            fontWeight: 600
                        }}
                    >
                        Motivo da consulta
                    </h5>

                    <p
                        className="mb-0"
                        style={{
                            color: "#555",
                            lineHeight: 1.7
                        }}
                    >
                        {consulta.motivo}
                    </p>
                </div>
            )}

            {/* ==================================================
                AVALIAÇÃO OFTALMOLÓGICA
            ================================================== */}

            <div
                className="mb-4"
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
            >
                <h5
                    style={{
                        color: "#4a4b4d",
                        fontWeight: 600,
                        marginBottom: "20px"
                    }}
                >
                    Avaliação dos olhos
                </h5>

                {!exame && (
                    <div
                        className="alert alert-light mb-0"
                        style={{
                            color: "#666"
                        }}
                    >
                        Nenhuma avaliação oftalmológica detalhada
                        foi registrada nesta consulta.
                    </div>
                )}

                {exame && (
                    <div className="row">

                        {/* ======================================
                            OLHO DIREITO
                        ====================================== */}

                        <div className="col-lg-6 mb-4">

                            <div
                                style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "12px",
                                    padding: "18px",
                                    height: "100%"
                                }}
                            >
                                <h6
                                    style={{
                                        color: "#4a4b4d",
                                        fontWeight: 700,
                                        marginBottom: "16px"
                                    }}
                                >
                                    OD — Olho Direito
                                </h6>

                                {resultadosOD.length === 0 && (
                                    <p
                                        className="text-muted mb-0"
                                    >
                                        Nenhuma informação registrada.
                                    </p>
                                )}

                                {resultadosOD.map(renderResultado)}

                            </div>

                        </div>

                        {/* ======================================
                            OLHO ESQUERDO
                        ====================================== */}

                        <div className="col-lg-6 mb-4">

                            <div
                                style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "12px",
                                    padding: "18px",
                                    height: "100%"
                                }}
                            >
                                <h6
                                    style={{
                                        color: "#4a4b4d",
                                        fontWeight: 700,
                                        marginBottom: "16px"
                                    }}
                                >
                                    OE — Olho Esquerdo
                                </h6>

                                {resultadosOE.length === 0 && (
                                    <p
                                        className="text-muted mb-0"
                                    >
                                        Nenhuma informação registrada.
                                    </p>
                                )}

                                {resultadosOE.map(renderResultado)}

                            </div>

                        </div>

                    </div>
                )}

            </div>

            {/* ==================================================
                CONCLUSÃO
            ================================================== */}

            {consulta.diagnostico &&
                consulta.diagnostico.trim() && (

                    <div
                        className="mb-4"
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "14px",
                            padding: "20px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                        }}
                    >
                        <h5
                            style={{
                                color: "#4a4b4d",
                                fontWeight: 600
                            }}
                        >
                            Conclusão
                        </h5>

                        <p
                            className="mb-0"
                            style={{
                                color: "#555",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line"
                            }}
                        >
                            {consulta.diagnostico}
                        </p>
                    </div>
                )}

            {/* ==================================================
                OBSERVAÇÕES E ORIENTAÇÕES
            ================================================== */}

            {consulta.observacoes &&
                consulta.observacoes.trim() && (

                    <div
                        className="mb-4"
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "14px",
                            padding: "20px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                        }}
                    >
                        <h5
                            style={{
                                color: "#4a4b4d",
                                fontWeight: 600
                            }}
                        >
                            Observações e orientações
                        </h5>

                        <p
                            className="mb-0"
                            style={{
                                color: "#555",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line"
                            }}
                        >
                            {consulta.observacoes}
                        </p>
                    </div>
                )}

            {/* ==================================================
                VETERINÁRIO RESPONSÁVEL
            ================================================== */}

            <div
                className="mb-4"
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
            >
                <h5
                    style={{
                        color: "#4a4b4d",
                        fontWeight: 600
                    }}
                >
                    Veterinário responsável
                </h5>

                <p
                    className="mb-0"
                    style={{
                        color: "#555"
                    }}
                >
                    {nomeVeterinario
                        ? `Dr. ${nomeVeterinario}`
                        : "Veterinário responsável pelo atendimento"}
                </p>
            </div>

            {/* ==================================================
                RODAPÉ
            ================================================== */}

            <div
                className="text-center"
                style={{
                    padding: "12px",
                    color: "#777",
                    fontSize: "12px"
                }}
            >
                Este relatório apresenta as informações registradas
                durante o atendimento veterinário. Em caso de dúvidas
                sobre a avaliação ou sobre os cuidados recomendados,
                entre em contato com o veterinário responsável.
            </div>

        </div>
    );
};

export default RelatorioTutor;