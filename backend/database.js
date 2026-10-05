const mysql = require('mysql2');
require('dotenv').config();

// Cria um "pool" de conexões com o banco de dados
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão para garantir que está tudo certo
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
    } else {
        console.log('Conectado à base de dados sov_db com sucesso! 🚀');
        connection.release();
    }
});

// Exporta a conexão para usarmos em outros arquivos
module.exports = pool.promise();