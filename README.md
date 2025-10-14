# Sistema de Gerenciamento de Veículos

Sistema completo para gerenciamento de veículos de garagens, com backend em Node.js e frontend em React.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Backend**: API REST desenvolvida com Node.js, Express e PostgreSQL
- **Frontend**: Interface de usuário desenvolvida com React, TypeScript e Material UI

## Funcionalidades

- Autenticação e autorização de usuários
- Cadastro e gerenciamento de veículos
- Upload e gerenciamento de imagens e vídeos
- Listagem de veículos com filtros e paginação
- Gerenciamento de usuários (para administradores)

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- Docker e Docker Compose (para ambiente containerizado)

## Configuração e Execução

### Usando Docker (Recomendado)

1. Clone o repositório
2. Na raiz do projeto, execute:

```bash
docker-compose up -d
```

A aplicação estará disponível em:
- Frontend: http://localhost
- Backend: http://localhost:3000

### Execução Local

#### Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (crie um arquivo .env baseado no .env.example)

4. Execute as migrações do banco de dados:
```bash
npm run migrate
```

5. Inicie o servidor:
```bash
npm run dev
```

#### Frontend

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Banco de Dados

O sistema utiliza PostgreSQL com as seguintes tabelas principais:

- **users**: Armazena informações dos usuários
- **garages**: Armazena informações das garagens
- **vehicles**: Armazena informações dos veículos
- **media**: Armazena referências para imagens e vídeos dos veículos

## API Endpoints

### Autenticação
- `POST /api/auth/login`: Autenticação de usuário
- `POST /api/auth/register`: Registro de nova garagem/usuário

### Veículos
- `GET /api/vehicles`: Lista todos os veículos
- `GET /api/vehicles/:id`: Obtém detalhes de um veículo específico
- `POST /api/vehicles`: Cria um novo veículo
- `PUT /api/vehicles/:id`: Atualiza um veículo existente
- `DELETE /api/vehicles/:id`: Remove um veículo

### Mídia
- `POST /api/vehicles/:id/media`: Upload de imagens/vídeos
- `DELETE /api/media/:id`: Remove uma mídia específica

### Usuários (acesso administrativo)
- `GET /api/users`: Lista todos os usuários
- `POST /api/users`: Cria um novo usuário
- `PUT /api/users/:id`: Atualiza um usuário existente
- `DELETE /api/users/:id`: Remove um usuário

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT para autenticação
- Multer para upload de arquivos

### Frontend
- React
- TypeScript
- Material UI
- React Router
- Axios
- Context API para gerenciamento de estado

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request