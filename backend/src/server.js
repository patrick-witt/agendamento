require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', routes);

// Middleware de tratamento de erros global
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
