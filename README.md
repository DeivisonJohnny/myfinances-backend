# My Finance Backend

Backend NestJS para aplicação de gestão financeira pessoal.

## 📚 Documentação

- **[Arquitetura](./docs/ARCHITECTURE.md)**: Visão geral da arquitetura, módulos, fluxos e padrões
- **[Guia do Desenvolvedor](./docs/DEVELOPER_GUIDE.md)**: Setup, padrões de código, e melhores práticas

## 🚀 Quick Start

```bash
# Instalar dependências
yarn install

# Configurar ambiente
cp .env.example .env
# Edite .env com suas configurações

# Executar migrations
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
yarn start:dev
```

O servidor estará disponível em `http://localhost:3000`

Documentação Swagger: `http://localhost:3000/api/docs`

## 🛠️ Stack Tecnológica

- **Framework**: NestJS 11.x
- **Linguagem**: TypeScript 5.9
- **ORM**: Prisma 7.3
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT + Passport
- **Validação**: class-validator
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest

## 📁 Estrutura do Projeto

```
backend/
├── prisma/              # Schema e migrations do banco
├── src/
│   ├── auth/            # Autenticação e autorização
│   ├── modules/         # Módulos de domínio
│   │   ├── account/     # Gestão de contas
│   │   └── users/       # Gestão de usuários
│   ├── prisma/          # Módulo Prisma
│   └── main.ts          # Entry point
├── test/                # Testes E2E
└── docs/                # Documentação
```

## 🔐 Autenticação

A aplicação usa JWT para autenticação. Todas as rotas são protegidas por padrão, exceto:

- `POST /api/auth/login` - Login
- `POST /api/account` - Criar conta

### Exemplo de Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123"
  }'
```

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Usando o Token

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <seu-token>"
```

## 🗄️ Banco de Dados

### Modelo de Dados

- **Account**: Conta organizacional
- **User**: Usuário do sistema
- **Role**: ADMIN | USER

### Comandos Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations (produção)
npx prisma migrate deploy

# Abrir Prisma Studio (GUI)
npx prisma studio

# Reset database (desenvolvimento)
npx prisma migrate reset
```

## 🧪 Testes

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Coverage
yarn test:cov

# Watch mode
yarn test:watch
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
yarn start:dev          # Watch mode
yarn start:debug        # Debug mode

# Build
yarn build              # Compilar TypeScript

# Produção
yarn start:prod         # Executar build

# Qualidade de Código
yarn lint               # ESLint
yarn format             # Prettier
```

## 🌍 Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/my_financy"

# JWT
JWT_SECRET="your-secret-key-here"

# Server (opcional)
PORT=3000
```

> **Dica**: Use `openssl rand -base64 32` para gerar um JWT_SECRET seguro.

## 📡 API Endpoints

### Autenticação

- `POST /api/auth/login` - Login (público)

### Contas

- `POST /api/account` - Criar conta (público)

### Usuários

- `POST /api/users` - Criar usuário (requer ADMIN)

Para documentação completa da API, acesse: `http://localhost:3000/api/docs`

## 🔒 Segurança

- **JWT**: Autenticação baseada em tokens
- **bcrypt**: Hashing de senhas (10 salt rounds)
- **Rate Limiting**: Proteção contra brute force
  - Global: 10 req/min
  - Login: 5 req/min
- **Guards**: AuthGuard (JWT) e RolesGuard (RBAC)
- **Validation**: Validação automática de DTOs

## 👥 Controle de Acesso

### Roles

- **ADMIN**: Acesso completo (criar usuários, etc)
- **USER**: Acesso padrão

### Decorators

```typescript
@Public()              // Rota pública
@Roles(Role.ADMIN)     // Requer role ADMIN
```

## 🏗️ Arquitetura

A aplicação segue uma arquitetura modular baseada em domínios:

- **Módulos**: Organizados por domínio de negócio
- **Services**: Lógica de negócio
- **Controllers**: Rotas HTTP
- **DTOs**: Validação de dados
- **Guards**: Autenticação e autorização
- **Prisma**: Acesso ao banco de dados

Para detalhes completos, consulte [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 📖 Guia de Desenvolvimento

Para informações sobre:
- Setup do ambiente
- Padrões de código
- Criação de módulos
- Testes
- Git workflow

Consulte o [Guia do Desenvolvedor](./docs/DEVELOPER_GUIDE.md)

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/minha-feature`
2. Faça suas alterações
3. Commit: `git commit -m "feat: adiciona nova funcionalidade"`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

Siga o [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit.

## 📄 Licença

UNLICENSED - Uso privado

## 📞 Suporte

- Documentação: [./docs](./docs)
- Issues: [GitHub Issues]
- NestJS: [https://docs.nestjs.com](https://docs.nestjs.com)
- Prisma: [https://www.prisma.io/docs](https://www.prisma.io/docs)
