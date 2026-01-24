# My Finance - Arquitetura do Backend

## Visão Geral

Este é um backend NestJS para uma aplicação de finanças pessoais, construído com TypeScript, Prisma ORM e PostgreSQL. A aplicação segue uma arquitetura modular baseada em domínios com autenticação JWT e controle de acesso baseado em roles.

### Stack Tecnológica

- **Framework**: NestJS 11.x
- **Linguagem**: TypeScript 5.9
- **ORM**: Prisma 7.3
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens) via `@nestjs/jwt` e Passport
- **Validação**: class-validator e class-transformer
- **Documentação API**: Swagger/OpenAPI
- **Segurança**: bcrypt para hashing de senhas, rate limiting via `@nestjs/throttler`
- **Testes**: Jest

---

## Estrutura do Projeto

```
backend/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── auth/                  # Módulo de autenticação
│   │   ├── decorators/        # Decorators customizados (@Public, @Roles)
│   │   ├── dto/               # DTOs de autenticação
│   │   ├── guards/            # Guards de autenticação e autorização
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── modules/               # Módulos de domínio
│   │   ├── account/           # Gestão de contas
│   │   └── users/             # Gestão de usuários
│   ├── prisma/                # Módulo Prisma
│   ├── common/                # Recursos compartilhados
│   ├── config/                # Configurações
│   ├── app.module.ts          # Módulo raiz
│   └── main.ts                # Entry point
├── test/                      # Testes E2E
├── package.json
└── tsconfig.json
```

---

## Modelo de Dados

### Diagrama de Relacionamentos

```mermaid
erDiagram
    Account ||--o{ User : "possui"
    
    Account {
        string id PK
        string name
        string email UK
    }
    
    User {
        string id PK
        string email UK
        string name
        string password
        Role role
        string accountId FK
    }
```

### Entidades

#### Account (Conta)
Representa uma conta organizacional que pode ter múltiplos usuários.

- **id**: Identificador único (CUID)
- **name**: Nome da conta
- **email**: Email único da conta
- **users**: Relação one-to-many com usuários

#### User (Usuário)
Representa um usuário individual do sistema.

- **id**: Identificador único (CUID)
- **email**: Email único do usuário
- **name**: Nome do usuário
- **password**: Senha hasheada (bcrypt)
- **role**: Role do usuário (ADMIN ou USER)
- **accountId**: Referência opcional à conta

#### Role (Enum)
- `ADMIN`: Administrador com permissões completas
- `USER`: Usuário padrão com permissões limitadas

---

## Arquitetura de Módulos

### 1. Auth Module (Autenticação)

**Responsabilidade**: Gerenciar autenticação e autorização de usuários.

#### Componentes

**AuthService**
- `login(auth: AuthDto)`: Valida credenciais e retorna JWT token
  - Busca usuário por email
  - Valida senha usando bcrypt
  - Gera e retorna access token JWT

**AuthController**
- `POST /api/auth/login`: Endpoint público de login
  - Rate limit: 5 requisições por minuto
  - Retorna: `{ access_token: string }`

**Guards**

1. **AuthGuard** (Global)
   - Valida JWT token em todas as rotas
   - Extrai token do header `Authorization: Bearer <token>`
   - Injeta payload do usuário em `request.user`
   - Permite rotas marcadas com `@Public()`

2. **RolesGuard** (Global)
   - Valida permissões baseadas em roles
   - Verifica se o usuário possui a role necessária
   - Usado em conjunto com decorator `@Roles()`

**Decorators**

1. **@Public()**: Marca rotas como públicas (bypass AuthGuard)
2. **@Roles(...roles)**: Define roles necessárias para acessar a rota

#### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant Prisma
    participant JwtService
    
    Client->>AuthController: POST /api/auth/login
    AuthController->>AuthService: login(credentials)
    AuthService->>Prisma: findUnique(email)
    Prisma-->>AuthService: User
    AuthService->>AuthService: compare(password, hash)
    AuthService->>JwtService: signAsync(payload)
    JwtService-->>AuthService: JWT token
    AuthService-->>AuthController: { access_token }
    AuthController-->>Client: 200 OK
```

#### Fluxo de Autorização

```mermaid
sequenceDiagram
    participant Client
    participant AuthGuard
    participant RolesGuard
    participant Controller
    
    Client->>AuthGuard: Request com JWT
    AuthGuard->>AuthGuard: Verificar @Public()
    alt Rota Pública
        AuthGuard-->>Controller: Permitir
    else Rota Protegida
        AuthGuard->>AuthGuard: Validar JWT
        AuthGuard->>AuthGuard: Injetar user em request
        AuthGuard->>RolesGuard: Próximo guard
        RolesGuard->>RolesGuard: Verificar @Roles()
        alt Sem roles requeridas
            RolesGuard-->>Controller: Permitir
        else Com roles requeridas
            RolesGuard->>RolesGuard: Validar role do usuário
            alt Role válida
                RolesGuard-->>Controller: Permitir
            else Role inválida
                RolesGuard-->>Client: 403 Forbidden
            end
        end
    end
```

---

### 2. Account Module (Contas)

**Responsabilidade**: Gerenciar criação e gestão de contas organizacionais.

#### Componentes

**AccountService**
- `create(account: AccountCreateDto)`: Cria nova conta com usuário admin
  - Valida confirmação de senha
  - Verifica duplicação de email (conta e usuário)
  - Cria conta e usuário em transação atômica
  - Usuário criado tem role ADMIN por padrão

**AccountController**
- `POST /api/account`: Endpoint público para criar conta
  - Retorna: `{ newUser, newAccount }`

#### Fluxo de Criação de Conta

```mermaid
sequenceDiagram
    participant Client
    participant AccountController
    participant AccountService
    participant Prisma
    
    Client->>AccountController: POST /api/account
    AccountController->>AccountService: create(data)
    AccountService->>AccountService: Validar senhas
    AccountService->>Prisma: Verificar duplicação
    AccountService->>Prisma: $transaction
    Note over Prisma: 1. Criar User (ADMIN)
    Note over Prisma: 2. Criar Account
    Note over Prisma: 3. Conectar User à Account
    Prisma-->>AccountService: { newUser, newAccount }
    AccountService-->>AccountController: Resultado
    AccountController-->>Client: 201 Created
```

---

### 3. Users Module (Usuários)

**Responsabilidade**: Gerenciar criação e gestão de usuários.

#### Componentes

**UsersService**
- `create(user: CreateUserDto)`: Cria novo usuário
  - Valida confirmação de senha
  - Verifica duplicação de email
  - Hash de senha com bcrypt (salt rounds: 10)
  - Retorna usuário sem campo password

**UserController**
- `POST /api/users`: Endpoint protegido para criar usuário
  - **Requer**: Role ADMIN (`@Roles(Role.ADMIN)`)
  - Retorna: Usuário criado (sem password)

---

### 4. Prisma Module

**Responsabilidade**: Fornecer cliente Prisma para toda a aplicação.

- Configurado como módulo global
- Cliente Prisma gerado em `generated/prisma/client`
- Conexão via `DATABASE_URL` do `.env`

---

## Segurança

### 1. Autenticação JWT

**Configuração**
- Secret: `process.env.JWT_SECRET`
- Token incluído no header: `Authorization: Bearer <token>`
- Payload contém dados do usuário (exceto password)

**Validação**
- Realizada pelo `AuthGuard` em todas as rotas (exceto `@Public()`)
- Token verificado usando `jwtService.verifyAsync()`
- Payload injetado em `request.user`

### 2. Hashing de Senhas

- Algoritmo: bcrypt
- Salt rounds: 10
- Senhas nunca retornadas em responses
- Comparação usando `bcrypt.compare()`

### 3. Rate Limiting

**Global**
- TTL: 60 segundos
- Limite: 10 requisições

**Login Endpoint**
- TTL: 60 segundos
- Limite: 5 requisições (proteção contra brute force)

### 4. Validação de Dados

- Pipes globais: `ValidationPipe`
- DTOs com decorators do `class-validator`
- Validação automática de tipos e constraints

### 5. Controle de Acesso

**Níveis de Proteção**
1. **Público**: Rotas com `@Public()` (login, criar conta)
2. **Autenticado**: Rotas sem decorators especiais
3. **Role-based**: Rotas com `@Roles()` (ex: criar usuário requer ADMIN)

---

## Padrões e Convenções

### 1. Estrutura de Módulos

Cada módulo de domínio segue a estrutura:

```
module-name/
├── dto/                    # Data Transfer Objects
│   └── *.dto.ts
├── module-name.controller.ts
├── module-name.service.ts
└── module-name.module.ts
```

### 2. DTOs (Data Transfer Objects)

- Usados para validação de entrada
- Decorators do `class-validator`
- Exportados como default
- Exemplo:
  ```typescript
  export default class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsEmail()
    email: string;
    
    @IsString()
    @MinLength(6)
    password: string;
  }
  ```

### 3. Services

- Lógica de negócio
- Injeção de dependências via constructor
- Métodos assíncronos
- Tratamento de erros com exceptions do NestJS

### 4. Controllers

- Rotas HTTP
- Validação via DTOs
- Delegação para services
- Decorators de rota e validação

### 5. Tratamento de Erros

**Exceptions Comuns**
- `UnauthorizedException`: Credenciais inválidas ou token expirado
- `BadRequestException`: Dados inválidos (senhas não coincidem, etc)
- `ConflictException`: Recurso já existe
- `ForbiddenException`: Permissão negada

### 6. Transações

- Uso de `prisma.$transaction()` para operações atômicas
- Exemplo: Criação de conta + usuário admin

---

## Configuração e Ambiente

### Variáveis de Ambiente (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# JWT
JWT_SECRET="your-secret-key-here"

# Server (opcional)
PORT=3000
```

### Scripts NPM

```bash
# Desenvolvimento
npm run start:dev          # Watch mode

# Build
npm run build              # Compilar TypeScript

# Produção
npm run start:prod         # Executar build

# Testes
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Coverage

# Linting
npm run lint               # ESLint
npm run format             # Prettier
```

### Prisma

```bash
# Gerar cliente
npx prisma generate

# Migrations
npx prisma migrate dev     # Desenvolvimento
npx prisma migrate deploy  # Produção

# Studio (GUI)
npx prisma studio
```

---

## API Endpoints

### Documentação Swagger

Disponível em: `http://localhost:3000/api/docs`

### Endpoints Disponíveis

#### Autenticação

**POST /api/auth/login** (Público)
```json
Request:
{
  "email": "user@example.com",
  "password": "senha123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Contas

**POST /api/account** (Público)
```json
Request:
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "passwordConfirmation": "senha123"
}

Response:
{
  "newUser": {
    "id": "clx...",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "ADMIN"
  },
  "newAccount": {
    "id": "clx...",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

#### Usuários

**POST /api/users** (Requer: ADMIN)
```json
Request:
Headers: { "Authorization": "Bearer <token>" }
Body:
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "password": "senha123",
  "confirmPassword": "senha123"
}

Response:
{
  "id": "clx...",
  "name": "Maria Santos",
  "email": "maria@example.com",
  "role": "USER"
}
```

---

## Fluxo de Request

```mermaid
graph TD
    A[Client Request] --> B[ThrottlerGuard]
    B --> C{Rate Limit OK?}
    C -->|Não| D[429 Too Many Requests]
    C -->|Sim| E[AuthGuard]
    E --> F{@Public?}
    F -->|Sim| J[Controller]
    F -->|Não| G{JWT Válido?}
    G -->|Não| H[401 Unauthorized]
    G -->|Sim| I[RolesGuard]
    I --> K{Role Requerida?}
    K -->|Não| J
    K -->|Sim| L{Role Válida?}
    L -->|Não| M[403 Forbidden]
    L -->|Sim| J
    J --> N[ValidationPipe]
    N --> O{DTO Válido?}
    O -->|Não| P[400 Bad Request]
    O -->|Sim| Q[Service]
    Q --> R[Prisma]
    R --> S[Database]
    S --> T[Response]
```

---

## Próximos Passos e Melhorias Sugeridas

### Funcionalidades Faltantes

1. **Gestão de Usuários**
   - Listar usuários
   - Atualizar usuário
   - Deletar usuário
   - Alterar senha

2. **Gestão de Contas**
   - Listar contas
   - Atualizar conta
   - Deletar conta

3. **Refresh Tokens**
   - Implementar refresh token strategy
   - Endpoint para renovar tokens

4. **Recuperação de Senha**
   - Endpoint para solicitar reset
   - Tokens temporários
   - Email service

### Melhorias de Segurança

1. **CORS**: Configurar políticas CORS apropriadas
2. **Helmet**: Adicionar headers de segurança
3. **Rate Limiting**: Configurações mais granulares por endpoint
4. **Logging**: Sistema de logs estruturado
5. **Auditoria**: Rastreamento de ações de usuários

### Melhorias de Código

1. **Testes**: Aumentar cobertura de testes
2. **Documentação**: Adicionar JSDoc aos métodos
3. **Validação**: DTOs mais robustos
4. **Error Handling**: Interceptor global de erros
5. **Logging**: Interceptor de logging

### DevOps

1. **Docker**: Containerização da aplicação
2. **CI/CD**: Pipeline de integração contínua
3. **Migrations**: Estratégia de migrations em produção
4. **Monitoring**: APM e health checks
5. **Environment**: Configuração multi-ambiente
