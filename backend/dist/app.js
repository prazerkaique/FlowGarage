import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import sequelize from './config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Configuração das variáveis de ambiente
dotenv.config();
// Inicialização do Express
const app = express();
const PORT = process.env.PORT || 3001;
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Pasta de uploads temporários (compatível com ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Rotas
app.use('/api', routes);
// Sincronização com o banco de dados
sequelize.sync({ alter: true })
    .then(() => {
    console.log('Banco de dados sincronizado');
    // Iniciar o servidor
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
})
    .catch(error => {
    console.error('Erro ao sincronizar banco de dados:', error);
});
export default app;
//# sourceMappingURL=app.js.map