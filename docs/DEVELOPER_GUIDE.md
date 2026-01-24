# Guia de Desenvolvimento - My Finance Backend

Este documento fornece diretrizes e melhores práticas para desenvolvedores que trabalham no backend do My Finance.

---

## Índice

1. [Setup do Ambiente](#setup-do-ambiente)
2. [Padrões de Código](#padrões-de-código)
3. [Estrutura de Módulos](#estrutura-de-módulos)
4. [Trabalhando com Prisma](#trabalhando-com-prisma)
5. [Autenticação e Autorização](#autenticação-e-autorização)
6. [Validação de Dados](#validação-de-dados)
7. [Tratamento de Erros](#tratamento-de-erros)
8. [Testes](#testes)
9. [Git Workflow](#git-workflow)
10. [Checklist de PR](#checklist-de-pr)

---

## Setup do Ambiente

### Pré-requisitos

- Node.js 18+ e npm/yarn
- PostgreSQL 14+
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone <repository-url>
cd backend

# 2. Instale as dependências
yarn install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# 4. Execute as migrations do Prisma
npx prisma migrate dev

# 5. (Opcional) Popule o banco com dados de teste
npx prisma db seed

# 6. Inicie o servidor de desenvolvimento
yarn start:dev
```

### Variáveis de Ambiente Necessárias

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/my_financy"

# JWT
JWT_SECRET="generate-a-secure-random-string"

# Server (opcional)
PORT=3000
```

> **Dica**: Use `openssl rand -base64 32` para gerar um JWT_SECRET seguro.

---

## Padrões de Código

### TypeScript

- **Strict Mode**: Mantenha `strictNullChecks: true`
- **Tipos Explícitos**: Prefira tipos explícitos em parâmetros de função
- **Evite `any`**: Use tipos específicos ou `unknown` quando necessário
- **Interfaces vs Types**: Use `interface` para objetos, `type` para unions/intersections

### Naming Conventions

```typescript
// Classes: PascalCase
export class UserService {}

// Interfaces: PascalCase com prefixo I (opcional)
interface IUserResponse {}

// Variáveis e funções: camelCase
const userName = 'João';
function getUserById() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;

// Arquivos: kebab-case
// user-service.ts, create-user.dto.ts
```

### Imports

```typescript
// 1. Imports externos primeiro
import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';

// 2. Linha em branco

// 3. Imports internos
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
```

### Formatação

- **Indentação**: 2 espaços
- **Aspas**: Single quotes (`'`)
- **Ponto e vírgula**: Obrigatório
- **Prettier**: Configurado automaticamente

```bash
# Formatar código
yarn format

# Lint
yarn lint
```

---

## Estrutura de Módulos

### Criando um Novo Módulo

```bash
# Use o CLI do NestJS
nest generate module modules/nome-do-modulo
nest generate controller modules/nome-do-modulo
nest generate service modules/nome-do-modulo
```

### Estrutura Padrão

```
modules/
└── nome-do-modulo/
    ├── dto/
    │   ├── create-nome.dto.ts
    │   └── update-nome.dto.ts
    ├── entities/              # (opcional) para classes de domínio
    │   └── nome.entity.ts
    ├── nome-do-modulo.controller.ts
    ├── nome-do-modulo.service.ts
    ├── nome-do-modulo.module.ts
    └── nome-do-modulo.controller.spec.ts
```

### Template de Módulo

```typescript
// nome-do-modulo.module.ts
import { Module } from '@nestjs/common';
import { NomeDoModuloController } from './nome-do-modulo.controller';
import { NomeDoModuloService } from './nome-do-modulo.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NomeDoModuloController],
  providers: [NomeDoModuloService],
  exports: [NomeDoModuloService], // Se outros módulos precisarem usar
})
export class NomeDoModuloModule {}
```

### Template de Service

```typescript
// nome-do-modulo.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { CreateNomeDto } from './dto/create-nome.dto';
import { UpdateNomeDto } from './dto/update-nome.dto';

@Injectable()
export class NomeDoModuloService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(createDto: CreateNomeDto) {
    return await this.prisma.nomeModel.create({
      data: createDto,
    });
  }

  async findAll() {
    return await this.prisma.nomeModel.findMany();
  }

  async findOne(id: string) {
    const item = await this.prisma.nomeModel.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Item com ID ${id} não encontrado`);
    }

    return item;
  }

  async update(id: string, updateDto: UpdateNomeDto) {
    await this.findOne(id); // Verifica se existe
    
    return await this.prisma.nomeModel.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe
    
    return await this.prisma.nomeModel.delete({
      where: { id },
    });
  }
}
```

### Template de Controller

```typescript
// nome-do-modulo.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NomeDoModuloService } from './nome-do-modulo.service';
import { CreateNomeDto } from './dto/create-nome.dto';
import { UpdateNomeDto } from './dto/update-nome.dto';
import { Roles, Role } from 'src/auth/decorators/roles.decorator';

@Controller('nome-do-modulo')
export class NomeDoModuloController {
  constructor(private readonly service: NomeDoModuloService) {}

  @Post()
  @Roles(Role.ADMIN) // Se necessário
  async create(@Body() createDto: CreateNomeDto) {
    return await this.service.create(createDto);
  }

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateNomeDto) {
    return await this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
```

---

## Trabalhando com Prisma

### Modificando o Schema

```prisma
// prisma/schema.prisma

// 1. Adicione ou modifique models
model Transaction {
  id          String   @id @default(cuid())
  amount      Decimal  @db.Decimal(10, 2)
  description String
  date        DateTime @default(now())
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
}

// 2. Adicione relação no User
model User {
  // ... campos existentes
  transactions Transaction[]
}
```

### Criando Migration

```bash
# 1. Crie a migration
npx prisma migrate dev --name add_transactions

# 2. Verifique a migration gerada em prisma/migrations/

# 3. O cliente Prisma é regenerado automaticamente
```

### Usando o Cliente Prisma

```typescript
// Injeção de dependência
constructor(private readonly prisma: PrismaClient) {}

// Operações básicas
await this.prisma.user.create({ data: {...} });
await this.prisma.user.findUnique({ where: { id } });
await this.prisma.user.findMany({ where: {...} });
await this.prisma.user.update({ where: { id }, data: {...} });
await this.prisma.user.delete({ where: { id } });

// Relações
await this.prisma.user.findUnique({
  where: { id },
  include: {
    account: true,
    transactions: true,
  },
});

// Transações
await this.prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: {...} });
  const account = await tx.account.create({ data: {...} });
  return { user, account };
});
```

### Boas Práticas Prisma

1. **Use transações** para operações que devem ser atômicas
2. **Índices**: Adicione `@@index` em campos frequentemente consultados
3. **Soft Delete**: Considere usar `deletedAt` ao invés de deletar
4. **Paginação**: Use `skip` e `take` para grandes datasets
5. **Select**: Use `select` para retornar apenas campos necessários

```typescript
// Paginação
async findAll(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    this.prisma.item.findMany({ skip, take: limit }),
    this.prisma.item.count(),
  ]);
  
  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

## Autenticação e Autorização

### Rotas Públicas

Use o decorator `@Public()` para rotas que não requerem autenticação:

```typescript
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@Post('login')
async login(@Body() credentials: AuthDto) {
  return await this.authService.login(credentials);
}
```

### Rotas Protegidas

Por padrão, todas as rotas são protegidas. O usuário autenticado está disponível em `request.user`:

```typescript
import { Request } from '@nestjs/common';

@Get('profile')
async getProfile(@Request() req) {
  const user = req.user; // { id, email, name, role, ... }
  return user;
}
```

### Controle de Acesso por Role

Use o decorator `@Roles()` para restringir acesso:

```typescript
import { Roles, Role } from 'src/auth/decorators/roles.decorator';

@Post('users')
@Roles(Role.ADMIN)
async createUser(@Body() createUserDto: CreateUserDto) {
  return await this.usersService.create(createUserDto);
}

// Múltiplas roles
@Patch('settings')
@Roles(Role.ADMIN, Role.MANAGER)
async updateSettings(@Body() settings: SettingsDto) {
  // ...
}
```

### Acessando Usuário Atual

Crie um decorator customizado para facilitar:

```typescript
// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Uso
@Get('my-data')
async getMyData(@CurrentUser() user) {
  return await this.service.findByUserId(user.id);
}
```

---

## Validação de Dados

### Criando DTOs

```typescript
// create-transaction.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsDate,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @Length(3, 255, { message: 'Descrição deve ter entre 3 e 255 caracteres' })
  description: string;

  @IsNumber()
  @IsPositive({ message: 'Valor deve ser positivo' })
  amount: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
```

### Validadores Comuns

```typescript
// Strings
@IsString()
@IsNotEmpty()
@IsEmail()
@IsUrl()
@Length(min, max)
@MinLength(min)
@MaxLength(max)
@Matches(/regex/)

// Números
@IsNumber()
@IsInt()
@IsPositive()
@IsNegative()
@Min(value)
@Max(value)

// Datas
@IsDate()
@Type(() => Date) // Importante para transformar string em Date

// Booleanos
@IsBoolean()

// Arrays
@IsArray()
@ArrayMinSize(min)
@ArrayMaxSize(max)

// Enums
@IsEnum(MyEnum)

// Objetos aninhados
@ValidateNested()
@Type(() => NestedDto)

// Opcionais
@IsOptional()
```

### Validação Customizada

```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial';
        },
      },
    });
  };
}

// Uso
@IsStrongPassword()
password: string;
```

---

## Tratamento de Erros

### Exceptions Padrão do NestJS

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

// 400 Bad Request
throw new BadRequestException('Dados inválidos');

// 401 Unauthorized
throw new UnauthorizedException('Credenciais inválidas');

// 403 Forbidden
throw new ForbiddenException('Sem permissão');

// 404 Not Found
throw new NotFoundException('Recurso não encontrado');

// 409 Conflict
throw new ConflictException('Recurso já existe');

// 500 Internal Server Error
throw new InternalServerErrorException('Erro interno');
```

### Tratamento de Erros Prisma

```typescript
import { Prisma } from 'generated/prisma/client';

try {
  await this.prisma.user.create({ data: {...} });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Violação de constraint única
    if (error.code === 'P2002') {
      throw new ConflictException('Email já cadastrado');
    }
    
    // Registro não encontrado
    if (error.code === 'P2025') {
      throw new NotFoundException('Registro não encontrado');
    }
  }
  
  throw new InternalServerErrorException('Erro ao processar requisição');
}
```

### Exception Filter Customizado (Opcional)

```typescript
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

// Registrar em main.ts
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## Testes

### Estrutura de Testes

```
src/
└── modules/
    └── users/
        ├── users.service.ts
        ├── users.service.spec.ts      # Unit tests
        ├── users.controller.ts
        └── users.controller.spec.ts   # Unit tests

test/
└── users.e2e-spec.ts                  # E2E tests
```

### Unit Test - Service

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaClient } from 'generated/prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaClient,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const expectedUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        ...expectedUser,
        password: 'hashed',
        accountId: null,
      });

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(result).not.toHaveProperty('password');
    });
  });
});
```

### E2E Test

```typescript
// test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login para obter token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/users (POST) - should create user', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe('newuser@example.com');
        expect(res.body).not.toHaveProperty('password');
      });
  });

  it('/api/users (POST) - should fail without auth', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      .expect(401);
  });
});
```

### Rodando Testes

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

---

## Git Workflow

### Branches

```
main              # Produção
├── develop       # Desenvolvimento
    ├── feature/nome-da-feature
    ├── fix/nome-do-fix
    └── hotfix/nome-do-hotfix
```

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: adiciona endpoint de transações"
git commit -m "feat(auth): implementa refresh token"

# Fixes
git commit -m "fix: corrige validação de email"
git commit -m "fix(users): resolve erro ao criar usuário"

# Docs
git commit -m "docs: atualiza README com instruções de setup"

# Refactor
git commit -m "refactor: melhora estrutura do AuthService"

# Tests
git commit -m "test: adiciona testes para UserService"

# Chore
git commit -m "chore: atualiza dependências"
```

### Workflow

```bash
# 1. Crie uma branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/minha-feature

# 2. Faça suas alterações e commits
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 3. Push para o repositório
git push origin feature/minha-feature

# 4. Abra um Pull Request para develop

# 5. Após aprovação e merge, delete a branch
git checkout develop
git pull origin develop
git branch -d feature/minha-feature
```

---

## Checklist de PR

Antes de abrir um Pull Request, verifique:

### Código

- [ ] Código segue os padrões do projeto
- [ ] Não há código comentado ou console.logs
- [ ] Variáveis e funções têm nomes descritivos
- [ ] Lógica complexa está comentada
- [ ] Não há duplicação de código

### Funcionalidade

- [ ] Feature funciona conforme esperado
- [ ] Casos de erro são tratados adequadamente
- [ ] Validações estão implementadas
- [ ] Autenticação/autorização está correta

### Testes

- [ ] Testes unitários foram escritos
- [ ] Testes E2E foram escritos (se aplicável)
- [ ] Todos os testes passam (`yarn test`)
- [ ] Coverage não diminuiu significativamente

### Database

- [ ] Migrations foram criadas e testadas
- [ ] Schema Prisma está atualizado
- [ ] Índices necessários foram adicionados
- [ ] Rollback da migration funciona

### Documentação

- [ ] README atualizado (se necessário)
- [ ] Swagger/OpenAPI atualizado
- [ ] Comentários JSDoc adicionados
- [ ] CHANGELOG atualizado

### Segurança

- [ ] Senhas são hasheadas
- [ ] Dados sensíveis não são logados
- [ ] Validação de input está implementada
- [ ] SQL injection prevenido (Prisma cuida disso)
- [ ] Rate limiting considerado

### Performance

- [ ] Queries N+1 evitadas
- [ ] Paginação implementada (se necessário)
- [ ] Índices de banco criados
- [ ] Caching considerado (se aplicável)

### Git

- [ ] Commits seguem Conventional Commits
- [ ] Branch está atualizada com develop
- [ ] Conflitos resolvidos
- [ ] Descrição do PR está clara

---

## Recursos Úteis

### Documentação Oficial

- [NestJS](https://docs.nestjs.com/)
- [Prisma](https://www.prisma.io/docs/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [class-validator](https://github.com/typestack/class-validator)

### Ferramentas

- [Prisma Studio](https://www.prisma.io/studio): GUI para visualizar banco de dados
- [Postman](https://www.postman.com/): Testar APIs
- [Insomnia](https://insomnia.rest/): Alternativa ao Postman

### Extensões VSCode Recomendadas

- Prisma
- ESLint
- Prettier
- GitLens
- Thunder Client (cliente HTTP)
- REST Client

---

## Dúvidas e Suporte

- Consulte a [documentação de arquitetura](./ARCHITECTURE.md)
- Verifique issues existentes no repositório
- Entre em contato com o time de desenvolvimento

---

**Última atualização**: 2026-01-24
