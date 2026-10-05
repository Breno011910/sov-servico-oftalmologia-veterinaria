// ============================================================
// IMPORTAÇÕES
// ============================================================

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

require("dotenv").config();

const db = require("./database");


// ============================================================
// CONFIGURAÇÃO DO SERVIDOR
// ============================================================

const app = express();

const PORT = process.env.PORT || 3333;


// ============================================================
// CONFIGURAÇÃO DE UPLOAD
// ============================================================

// Pasta principal onde as fotos das consultas serão armazenadas
const pastaUploads = path.join(
    __dirname,
    "uploads",
    "consultas"
);

// Cria a pasta caso ainda não exista
if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, {
        recursive: true
    });
}


// ============================================================
// MULTER — RECEBIMENTO DAS FOTOS
// ============================================================

// Usamos memória temporariamente.
// A foto só será gravada no disco depois que verificarmos
// se a consulta pertence ao veterinário logado.
const armazenamento = multer.memoryStorage();


// Tipos de imagem permitidos
const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const upload = multer({

    storage: armazenamento,

    limits: {
        // Limite inicial de 5 MB por foto
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {

        if (!tiposPermitidos.includes(file.mimetype)) {
            return callback(
                new Error(
                    "Formato de imagem não permitido. Use JPG, PNG ou WEBP."
                )
            );
        }

        callback(null, true);
    }
});


// ============================================================
// MIDDLEWARES
// ============================================================

app.use(cors());

app.use(express.json());


// ============================================================
// ROTA DE TESTE
// ============================================================

app.get("/ping", (req, res) => {

    res.json({
        mensagem: "Pong! Backend do S.O.V funcionando."
    });

});


// ============================================================
// CADASTRO DE VETERINÁRIO
// ============================================================

app.post("/registro", async (req, res) => {

    try {

        const {
            nome,
            tratamento,
            email,
            senha
        } = req.body;


        // ============================================================
        // TICKET 01 - VALIDAÇÃO DOS CAMPOS
        // ============================================================

        if (!nome || !tratamento || !email || !senha) {

            return res.status(400).json({
                mensagem:
                    "Nome, tratamento, email e senha são obrigatórios."
            });

        }


        // ============================================================
        // TICKET 02 - VALIDAR TRATAMENTO
        // ============================================================

        if (
            tratamento !== "Dr." &&
            tratamento !== "Dra."
        ) {

            return res.status(400).json({
                mensagem:
                    "O tratamento deve ser Dr. ou Dra."
            });

        }


        // ============================================================
        // TICKET 03 - VALIDAR SENHA
        // ============================================================

        const senhaForte =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;


        if (!senhaForte.test(senha)) {

            return res.status(400).json({
                mensagem:
                    "A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial."
            });

        }


        // ============================================================
        // TICKET 04 - VERIFICAR E-MAIL EXISTENTE
        // ============================================================

        const [usuarioExistente] = await db.query(
            `
            SELECT id
            FROM veterinarios
            WHERE email = ?
            `,
            [email]
        );


        if (usuarioExistente.length > 0) {

            return res.status(409).json({
                mensagem:
                    "Este email já está cadastrado."
            });

        }


        // ============================================================
        // TICKET 05 - CRIPTOGRAFAR SENHA
        // ============================================================

        const senhaHash =
            await bcrypt.hash(senha, 10);


        // ============================================================
        // TICKET 06 - SALVAR VETERINÁRIO
        // ============================================================

        await db.query(
            `
            INSERT INTO veterinarios
                (nome, tratamento, email, senha_hash)
            VALUES (?, ?, ?, ?)
            `,
            [
                nome,
                tratamento,
                email,
                senhaHash
            ]
        );


        // ============================================================
        // TICKET 07 - RESPOSTA
        // ============================================================

        return res.status(201).json({
            mensagem:
                "Veterinário cadastrado com sucesso."
        });


    } catch (erro) {

        console.error(
            "Erro no cadastro:",
            erro
        );


        return res.status(500).json({
            mensagem:
                "Erro interno do servidor."
        });

    }

});


// ============================================================
// LOGIN
// ============================================================

app.post("/login", async (req, res) => {

    try {

        const {
            email,
            senha
        } = req.body;


        if (!email || !senha) {

            return res.status(400).json({
                mensagem:
                    "Email e senha são obrigatórios."
            });

        }


        const [usuarios] = await db.query(
            `
            SELECT
                id,
                nome,
                tratamento,
                email,
                senha_hash
            FROM veterinarios
            WHERE email = ?
            `,
            [email]
        );


        if (usuarios.length === 0) {

            return res.status(401).json({
                mensagem:
                    "Email ou senha inválidos."
            });

        }


        const usuario = usuarios[0];


        const senhaValida =
            await bcrypt.compare(
                senha,
                usuario.senha_hash
            );


        if (!senhaValida) {

            return res.status(401).json({
                mensagem:
                    "Email ou senha inválidos."
            });

        }


        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );


        return res.json({

            mensagem:
                "Login realizado com sucesso.",

            token,

            veterinario: {
                id: usuario.id,
                nome: usuario.nome,
                tratamento: usuario.tratamento,
                email: usuario.email
            }

        });


    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );


        return res.status(500).json({
            mensagem:
                "Erro interno do servidor."
        });

    }

});


// ============================================================
// MIDDLEWARE — VERIFICAR TOKEN
// ============================================================

function verificarToken(req, res, next) {

    const autorizacao =
        req.headers.authorization;


    if (!autorizacao) {

        return res.status(401).json({
            mensagem:
                "Token não informado."
        });

    }


    const partes =
        autorizacao.split(" ");


    if (
        partes.length !== 2 ||
        partes[0] !== "Bearer"
    ) {

        return res.status(401).json({
            mensagem:
                "Formato de token inválido."
        });

    }


    const token = partes[1];


    try {

        const usuario =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.veterinario = usuario;


        next();


    } catch (erro) {

        return res.status(401).json({
            mensagem:
                "Token inválido ou expirado."
        });

    }

}


// ============================================================
// CADASTRAR PACIENTE
// ============================================================

app.post(
    "/pacientes",
    verificarToken,
    async (req, res) => {

        try {

            const veterinarioId =
                req.veterinario.id;


            const {
                nome_animal,
                especie,
                raca,
                sexo,
                idade,
                nome_tutor,
                telefone_tutor
            } = req.body;


            if (!nome_animal || !nome_tutor) {

                return res.status(400).json({
                    mensagem:
                        "Nome do animal e nome do tutor são obrigatórios."
                });

            }


            const [resultado] =
                await db.query(
                    `
                    INSERT INTO pacientes
                    (
                        veterinario_id,
                        nome_animal,
                        especie,
                        raca,
                        sexo,
                        idade,
                        nome_tutor,
                        telefone_tutor
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        veterinarioId,
                        nome_animal,
                        especie || null,
                        raca || null,
                        sexo || null,
                        idade || null,
                        nome_tutor,
                        telefone_tutor || null
                    ]
                );


            return res.status(201).json({

                mensagem:
                    "Paciente cadastrado com sucesso.",

                paciente_id:
                    resultado.insertId

            });


        } catch (erro) {

            console.error(
                "Erro ao cadastrar paciente:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// LISTAR PACIENTES DO VETERINÁRIO LOGADO
// ============================================================

app.get(
    "/pacientes",
    verificarToken,
    async (req, res) => {

        try {

            const veterinarioId =
                req.veterinario.id;


            const [pacientes] =
                await db.query(
                    `
                    SELECT
                        id,
                        nome_animal,
                        especie,
                        raca,
                        sexo,
                        idade,
                        nome_tutor,
                        telefone_tutor,
                        criado_em
                    FROM pacientes
                    WHERE veterinario_id = ?
                    ORDER BY nome_animal ASC
                    `,
                    [veterinarioId]
                );


            return res.json(pacientes);


        } catch (erro) {

            console.error(
                "Erro ao listar pacientes:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// BUSCAR PACIENTE POR ID
// ============================================================

app.get(
    "/pacientes/:id",
    verificarToken,
    async (req, res) => {

        try {

            const pacienteId =
                req.params.id;

            const veterinarioId =
                req.veterinario.id;


            const [pacientes] =
                await db.query(
                    `
                    SELECT
                        id,
                        nome_animal,
                        especie,
                        raca,
                        sexo,
                        idade,
                        nome_tutor,
                        telefone_tutor,
                        criado_em
                    FROM pacientes
                    WHERE id = ?
                      AND veterinario_id = ?
                    `,
                    [
                        pacienteId,
                        veterinarioId
                    ]
                );


            if (pacientes.length === 0) {

                return res.status(404).json({
                    mensagem:
                        "Paciente não encontrado."
                });

            }


            return res.json(
                pacientes[0]
            );


        } catch (erro) {

            console.error(
                "Erro ao buscar paciente:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// CADASTRAR CONSULTA
// ============================================================

app.post(
    "/consultas",
    verificarToken,
    async (req, res) => {

        try {

            const veterinarioId =
                req.veterinario.id;


            const {
                paciente_id,
                motivo,
                diagnostico,
                observacoes
            } = req.body;


            if (!paciente_id) {

                return res.status(400).json({
                    mensagem:
                        "Paciente é obrigatório."
                });

            }


            const [paciente] =
                await db.query(
                    `
                    SELECT id
                    FROM pacientes
                    WHERE id = ?
                      AND veterinario_id = ?
                    `,
                    [
                        paciente_id,
                        veterinarioId
                    ]
                );


            if (paciente.length === 0) {

                return res.status(404).json({
                    mensagem:
                        "Paciente não encontrado."
                });

            }


            const [resultado] =
                await db.query(
                    `
                    INSERT INTO consultas
                    (
                        paciente_id,
                        veterinario_id,
                        motivo,
                        diagnostico,
                        observacoes
                    )
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        paciente_id,
                        veterinarioId,
                        motivo || null,
                        diagnostico || null,
                        observacoes || null
                    ]
                );


            return res.status(201).json({

                mensagem:
                    "Consulta registrada com sucesso.",

                consulta_id:
                    resultado.insertId

            });


        } catch (erro) {

            console.error(
                "Erro ao cadastrar consulta:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// LISTAR TODAS AS CONSULTAS DO VETERINÁRIO
// ============================================================

app.get(
    "/consultas",
    verificarToken,
    async (req, res) => {

        try {

            const veterinarioId =
                req.veterinario.id;


            const [consultas] =
                await db.query(
                    `
                    SELECT
                        c.id,
                        c.paciente_id,
                        c.data_consulta,
                        c.motivo,
                        c.diagnostico,
                        c.observacoes,
                        p.nome_animal,
                        p.nome_tutor
                    FROM consultas c
                    INNER JOIN pacientes p
                        ON p.id = c.paciente_id
                    WHERE c.veterinario_id = ?
                    ORDER BY c.data_consulta DESC
                    `,
                    [veterinarioId]
                );


            return res.json(consultas);


        } catch (erro) {

            console.error(
                "Erro ao listar consultas:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// LISTAR CONSULTAS DE UM PACIENTE
// ============================================================

app.get(
    "/consultas/paciente/:id",
    verificarToken,
    async (req, res) => {

        try {

            const pacienteId =
                req.params.id;

            const veterinarioId =
                req.veterinario.id;


            const [consultas] =
                await db.query(
                    `
                    SELECT
                        c.id,
                        c.paciente_id,
                        c.data_consulta,
                        c.motivo,
                        c.diagnostico,
                        c.observacoes
                    FROM consultas c
                    WHERE c.paciente_id = ?
                      AND c.veterinario_id = ?
                    ORDER BY c.data_consulta DESC
                    `,
                    [
                        pacienteId,
                        veterinarioId
                    ]
                );


            return res.json(consultas);


        } catch (erro) {

            console.error(
                "Erro ao listar consultas do paciente:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// BUSCAR UMA CONSULTA ESPECÍFICA
// ============================================================

app.get(
    "/consultas/:id",
    verificarToken,
    async (req, res) => {

        try {

            const consultaId =
                req.params.id;

            const veterinarioId =
                req.veterinario.id;


            const [consultas] =
                await db.query(
                    `
                    SELECT
                        c.id,
                        c.paciente_id,
                        c.data_consulta,
                        c.motivo,
                        c.diagnostico,
                        c.observacoes,
                        p.nome_animal,
                        p.nome_tutor
                    FROM consultas c
                    INNER JOIN pacientes p
                        ON p.id = c.paciente_id
                    WHERE c.id = ?
                      AND c.veterinario_id = ?
                    `,
                    [
                        consultaId,
                        veterinarioId
                    ]
                );


            if (consultas.length === 0) {

                return res.status(404).json({
                    mensagem:
                        "Consulta não encontrada."
                });

            }


            return res.json(
                consultas[0]
            );


        } catch (erro) {

            console.error(
                "Erro ao buscar consulta:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// CADASTRAR EXAME OFTALMOLÓGICO
// ============================================================

app.post(
    "/exames-oftalmologicos",
    verificarToken,
    async (req, res) => {

        try {

            const veterinarioId =
                req.veterinario.id;


            const {

                consulta_id,

                // OD
                reflexo_pupilar_direto_od,
                reflexo_pupilar_consensual_od,
                teste_ameaca_od,
                schirmer_od,
                pressao_intraocular_od,
                fluoresceina_od,
                teste_jones_od,
                palpebra_od,
                secrecao_od,
                conjuntiva_od,
                cornea_od,
                camara_anterior_od,
                iris_od,
                pupila_od,
                lente_od,
                fundo_olho_od,
                vitreo_od,

                // OE
                reflexo_pupilar_direto_oe,
                reflexo_pupilar_consensual_oe,
                teste_ameaca_oe,
                schirmer_oe,
                pressao_intraocular_oe,
                fluoresceina_oe,
                teste_jones_oe,
                palpebra_oe,
                secrecao_oe,
                conjuntiva_oe,
                cornea_oe,
                camara_anterior_oe,
                iris_oe,
                pupila_oe,
                lente_oe,
                fundo_olho_oe,
                vitreo_oe

            } = req.body;


            if (!consulta_id) {

                return res.status(400).json({
                    mensagem:
                        "Consulta é obrigatória."
                });

            }


            const [consulta] =
                await db.query(
                    `
                    SELECT id
                    FROM consultas
                    WHERE id = ?
                      AND veterinario_id = ?
                    `,
                    [
                        consulta_id,
                        veterinarioId
                    ]
                );


            if (consulta.length === 0) {

                return res.status(404).json({
                    mensagem:
                        "Consulta não encontrada."
                });

            }


            const [resultado] =
                await db.query(
                    `
                    INSERT INTO exame_oftalmologico
                    (
                        consulta_id,

                        reflexo_pupilar_direto_od,
                        reflexo_pupilar_consensual_od,
                        teste_ameaca_od,
                        schirmer_od,
                        pressao_intraocular_od,
                        fluoresceina_od,
                        teste_jones_od,
                        palpebra_od,
                        secrecao_od,
                        conjuntiva_od,
                        cornea_od,
                        camara_anterior_od,
                        iris_od,
                        pupila_od,
                        lente_od,
                        fundo_olho_od,
                        vitreo_od,

                        reflexo_pupilar_direto_oe,
                        reflexo_pupilar_consensual_oe,
                        teste_ameaca_oe,
                        schirmer_oe,
                        pressao_intraocular_oe,
                        fluoresceina_oe,
                        teste_jones_oe,
                        palpebra_oe,
                        secrecao_oe,
                        conjuntiva_oe,
                        cornea_oe,
                        camara_anterior_oe,
                        iris_oe,
                        pupila_oe,
                        lente_oe,
                        fundo_olho_oe,
                        vitreo_oe
                    )
                    VALUES
                    (
                        ?,

                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,

                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                    `,
                    [

                        consulta_id,

                        // OD
                        reflexo_pupilar_direto_od,
                        reflexo_pupilar_consensual_od,
                        teste_ameaca_od,
                        schirmer_od,
                        pressao_intraocular_od,
                        fluoresceina_od,
                        teste_jones_od,
                        palpebra_od,
                        secrecao_od,
                        conjuntiva_od,
                        cornea_od,
                        camara_anterior_od,
                        iris_od,
                        pupila_od,
                        lente_od,
                        fundo_olho_od,
                        vitreo_od,

                        // OE
                        reflexo_pupilar_direto_oe,
                        reflexo_pupilar_consensual_oe,
                        teste_ameaca_oe,
                        schirmer_oe,
                        pressao_intraocular_oe,
                        fluoresceina_oe,
                        teste_jones_oe,
                        palpebra_oe,
                        secrecao_oe,
                        conjuntiva_oe,
                        cornea_oe,
                        camara_anterior_oe,
                        iris_oe,
                        pupila_oe,
                        lente_oe,
                        fundo_olho_oe,
                        vitreo_oe

                    ]
                );


            return res.status(201).json({

                mensagem:
                    "Exame oftalmológico registrado com sucesso.",

                exame_id:
                    resultado.insertId

            });


        } catch (erro) {

            console.error(
                "Erro ao cadastrar exame oftalmológico:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// BUSCAR EXAME OFTALMOLÓGICO DE UMA CONSULTA
// ============================================================

app.get(
    "/exames-oftalmologicos/consulta/:consultaId",
    verificarToken,
    async (req, res) => {

        try {

            const consultaId =
                req.params.consultaId;

            const veterinarioId =
                req.veterinario.id;


            if (
                !Number.isInteger(
                    Number(consultaId)
                )
            ) {

                return res.status(400).json({
                    mensagem:
                        "ID da consulta inválido."
                });

            }


            const [resultado] =
                await db.query(
                    `
                    SELECT e.*
                    FROM exame_oftalmologico e
                    INNER JOIN consultas c
                        ON c.id = e.consulta_id
                    WHERE e.consulta_id = ?
                      AND c.veterinario_id = ?
                    ORDER BY e.id DESC
                    LIMIT 1
                    `,
                    [
                        consultaId,
                        veterinarioId
                    ]
                );


            if (resultado.length === 0) {

                return res.status(404).json({
                    mensagem:
                        "Exame oftalmológico não encontrado."
                });

            }


            return res.json(
                resultado[0]
            );


        } catch (erro) {

            console.error(
                "Erro ao buscar exame oftalmológico:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// UPLOAD DE FOTO DA CONSULTA
// ============================================================

app.post(
    "/consultas/:consultaId/fotos",
    verificarToken,
    upload.single("foto"),
    async (req, res) => {

        try {

            const consultaId =
                req.params.consultaId;

            const veterinarioId =
                req.veterinario.id;

            const olho =
                req.body.olho;


            // ------------------------------------------------
            // VALIDAÇÃO DO ID
            // ------------------------------------------------

            if (
                !Number.isInteger(
                    Number(consultaId)
                )
            ) {

                return res.status(400).json({
                    mensagem:
                        "ID da consulta inválido."
                });

            }


            // ------------------------------------------------
            // VALIDAÇÃO DO OLHO
            // ------------------------------------------------

            if (
                olho !== "OD" &&
                olho !== "OE"
            ) {

                return res.status(400).json({
                    mensagem:
                        "O olho deve ser informado como OD ou OE."
                });

            }


            // ------------------------------------------------
            // VALIDAÇÃO DO ARQUIVO
            // ------------------------------------------------

            if (!req.file) {

                return res.status(400).json({
                    mensagem:
                        "Nenhuma foto foi enviada."
                });

            }


            // ------------------------------------------------
            // VERIFICAR SE A CONSULTA PERTENCE AO VETERINÁRIO
            // ------------------------------------------------

            const [consultas] =
                await db.query(
                    `
                    SELECT id
                    FROM consultas
                    WHERE id = ?
                      AND veterinario_id = ?
                    `,
                    [
                        consultaId,
                        veterinarioId
                    ]
                );


            if (consultas.length === 0) {

                return res.status(404).json({
                    mensagem:
                        "Consulta não encontrada."
                });

            }


            // ------------------------------------------------
            // CRIAR PASTA DA CONSULTA
            // ------------------------------------------------

            const pastaConsulta =
                path.join(
                    pastaUploads,
                    String(consultaId)
                );


            if (!fs.existsSync(pastaConsulta)) {

                fs.mkdirSync(
                    pastaConsulta,
                    {
                        recursive: true
                    }
                );

            }


            // ------------------------------------------------
            // GERAR NOME INTERNO SEGURO
            // ------------------------------------------------

            const extensoes = {

                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/webp": ".webp"

            };


            const extensao =
                extensoes[req.file.mimetype];


            const nomeInterno =
                `${olho}-${crypto
                    .randomBytes(16)
                    .toString("hex")}${extensao}`;


            const caminhoCompleto =
                path.join(
                    pastaConsulta,
                    nomeInterno
                );


            // ------------------------------------------------
            // SALVAR ARQUIVO NO DISCO
            // ------------------------------------------------

            fs.writeFileSync(
                caminhoCompleto,
                req.file.buffer
            );


            // ------------------------------------------------
            // CAMINHO RELATIVO PARA O BANCO
            // ------------------------------------------------

            const caminhoBanco =
                path.join(
                    "uploads",
                    "consultas",
                    String(consultaId),
                    nomeInterno
                );


            // ------------------------------------------------
            // SALVAR METADADOS NO BANCO
            // ------------------------------------------------

            try {

                const [resultado] =
                    await db.query(
                        `
                        INSERT INTO fotos_consulta
                        (
                            consulta_id,
                            olho,
                            nome_arquivo,
                            caminho_arquivo,
                            tipo_arquivo,
                            tamanho_arquivo
                        )
                        VALUES (?, ?, ?, ?, ?, ?)
                        `,
                        [
                            consultaId,
                            olho,
                            req.file.originalname,
                            caminhoBanco,
                            req.file.mimetype,
                            req.file.size
                        ]
                    );


                return res.status(201).json({

                    mensagem:
                        "Foto enviada com sucesso.",

                    foto_id:
                        resultado.insertId,

                    olho,

                    nome_arquivo:
                        req.file.originalname

                });


            } catch (erroBanco) {

                // Se o banco falhar, removemos a foto
                // para não deixar arquivo órfão.
                if (
                    fs.existsSync(
                        caminhoCompleto
                    )
                ) {

                    fs.unlinkSync(
                        caminhoCompleto
                    );

                }

                throw erroBanco;

            }


        } catch (erro) {

            console.error(
                "Erro ao enviar foto:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// LISTAR FOTOS DE UMA CONSULTA
// ============================================================

app.get(
    "/consultas/:consultaId/fotos",
    verificarToken,
    async (req, res) => {

        try {

            const consultaId =
                req.params.consultaId;

            const veterinarioId =
                req.veterinario.id;


            if (
                !Number.isInteger(
                    Number(consultaId)
                )
            ) {

                return res.status(400).json({
                    mensagem:
                        "ID da consulta inválido."
                });

            }


            // ------------------------------------------------
            // GARANTIR QUE A CONSULTA PERTENCE AO VETERINÁRIO
            // ------------------------------------------------

            const [consultas] =
                await db.query(
                    `
                    SELECT id
                    FROM consultas
                    WHERE id = ?
                      AND veterinario_id = ?
                    `,
                    [
                        consultaId,
                        veterinarioId
                    ]
                );


            if (consultas.length === 0) {

                return res.status(404).json({
                    mensagem:
                        "Consulta não encontrada."
                });

            }


            // ------------------------------------------------
            // BUSCAR FOTOS
            // ------------------------------------------------

            const [fotos] =
                await db.query(
                    `
                    SELECT
                        id,
                        consulta_id,
                        olho,
                        nome_arquivo,
                        tipo_arquivo,
                        tamanho_arquivo,
                        criado_em
                    FROM fotos_consulta
                    WHERE consulta_id = ?
                    ORDER BY olho ASC, criado_em ASC
                    `,
                    [consultaId]
                );


            return res.json(fotos);


        } catch (erro) {

            console.error(
                "Erro ao listar fotos:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// VISUALIZAR FOTO
// ============================================================

app.get(
    "/fotos/:id",
    verificarToken,
    async (req, res) => {

        try {

            const fotoId =
                req.params.id;

            const veterinarioId =
                req.veterinario.id;


            if (
                !Number.isInteger(
                    Number(fotoId)
                )
            ) {

                return res.status(400).json({
                    mensagem:
                        "ID da foto inválido."
                });

            }


            // ------------------------------------------------
            // BUSCAR FOTO + VALIDAR PROPRIEDADE DA CONSULTA
            // ------------------------------------------------

            const [fotos] =
                await db.query(
                    `
                    SELECT
                        f.id,
                        f.caminho_arquivo,
                        f.tipo_arquivo
                    FROM fotos_consulta f
                    INNER JOIN consultas c
                        ON c.id = f.consulta_id
                    WHERE f.id = ?
                      AND c.veterinario_id = ?
                    `,
                    [
                        fotoId,
                        veterinarioId
                    ]
                );


            if (fotos.length === 0) {

                return res.status(404).json({
                    mensagem:
                        "Foto não encontrada."
                });

            }


            const foto =
                fotos[0];


            // ------------------------------------------------
            // MONTAR CAMINHO DO ARQUIVO
            // ------------------------------------------------

            const caminhoArquivo =
                path.join(
                    __dirname,
                    foto.caminho_arquivo
                );


            // ------------------------------------------------
            // VERIFICAR SE O ARQUIVO EXISTE
            // ------------------------------------------------

            if (
                !fs.existsSync(
                    caminhoArquivo
                )
            ) {

                return res.status(404).json({
                    mensagem:
                        "Arquivo da foto não encontrado."
                });

            }


            // ------------------------------------------------
            // INFORMAR TIPO DA IMAGEM
            // ------------------------------------------------

            res.setHeader(
                "Content-Type",
                foto.tipo_arquivo
            );


            // ------------------------------------------------
            // ENVIAR FOTO
            // ------------------------------------------------

            return res.sendFile(
                caminhoArquivo
            );


        } catch (erro) {

            console.error(
                "Erro ao visualizar foto:",
                erro
            );


            return res.status(500).json({
                mensagem:
                    "Erro interno do servidor."
            });

        }

    }
);


// ============================================================
// TRATAMENTO DE ERROS DO MULTER
// ============================================================

app.use(
    (erro, req, res, next) => {

        if (
            erro instanceof multer.MulterError
        ) {

            if (
                erro.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({
                    mensagem:
                        "A foto não pode ultrapassar 5 MB."
                });

            }


            return res.status(400).json({
                mensagem:
                    "Erro ao enviar a foto."
            });

        }


        if (
            erro &&
            erro.message ===
                "Formato de imagem não permitido. Use JPG, PNG ou WEBP."
        ) {

            return res.status(400).json({
                mensagem:
                    erro.message
            });

        }


        next(erro);

    }
);


// ============================================================
// INICIA O SERVIDOR
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor do S.O.V rodando na porta ${PORT}`
        );

    }
);