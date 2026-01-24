# Quick Reference - My Finance Backend

Guia rápido de referência para comandos e padrões comuns.

## 🚀 Comandos Essenciais

### Desenvolvimento

```bash
# Iniciar servidor
yarn start:dev

# Build
yarn build

# Testes
yarn test
yarn test:e2e
yarn test:cov

# Lint e Format
yarn lint
yarn format
```

### Prisma

```bash
# Gerar cliente
npx prisma generate

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations (produção)
npx prisma migrate deploy

# Abrir Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Git

```bash
# Nova feature
git checkout -b feature/nome-da-feature

# Commit
git commit -m "feat: descrição"

# Push
git push origin feature/nome-da-feature
```

## 📝 Templates de Código

### Criar Módulo

```bash
nest g module modules/nome
nest g controller modules/nome
nest g service modules/nome
```

### DTO

```typescript
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export default class CreateNomeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}
```

### Service

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class NomeService {
  constructor(private readonly prisma: PrismaClient) {}

  async findOne(id: string) {
    const item = await this.prisma.model.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item não encontrado');
    return item;
  }
}
```

### Controller

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Roles, Role } from 'src/auth/decorators/roles.decorator';

@Controller('nome')
export class NomeController {
  constructor(private readonly service: NomeService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateNomeDto) {
    return await this.service.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }
}
```

## 🔐 Autenticação

### Rota Pública

```typescript
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@Post('login')
async login(@Body() credentials: AuthDto) {
  return await this.authService.login(credentials);
}
```

### Rota com Role

```typescript
import { Roles, Role } from 'src/auth/decorators/roles.decorator';

@Roles(Role.ADMIN)
@Post('users')
async createUser(@Body() dto: CreateUserDto) {
  return await this.usersService.create(dto);
}
```

### Acessar Usuário Atual

```typescript
import { Request } from '@nestjs/common';

@Get('profile')
async getProfile(@Request() req) {
  const user = req.user; // { id, email, name, role }
  return user;
}
```

## 🗄️ Prisma Queries

```typescript
// Create
await this.prisma.user.create({
  data: { name: 'João', email: 'joao@example.com' }
});

// Find One
await this.prisma.user.findUnique({
  where: { id: '123' }
});

// Find Many
await this.prisma.user.findMany({
  where: { role: 'ADMIN' },
  include: { account: true }
});

// Update
await this.prisma.user.update({
  where: { id: '123' },
  data: { name: 'Novo Nome' }
});

// Delete
await this.prisma.user.delete({
  where: { id: '123' }
});

// Transaction
await this.prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: {...} });
  const account = await tx.account.create({ data: {...} });
  return { user, account };
});

// Paginação
await this.prisma.user.findMany({
  skip: (page - 1) * limit,
  take: limit
});
```

## ⚠️ Exceptions

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

throw new BadRequestException('Dados inválidos');
throw new UnauthorizedException('Não autenticado');
throw new ForbiddenException('Sem permissão');
throw new NotFoundException('Não encontrado');
throw new ConflictException('Já existe');
```

## ✅ Validadores Comuns

```typescript
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsPositive,
  IsDate,
  IsOptional,
  Min,
  Max,
  Length,
  MinLength,
  MaxLength,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

@IsString()
@IsNotEmpty()
name: string;

@IsEmail()
email: string;

@IsNumber()
@IsPositive()
amount: number;

@Min(0)
@Max(100)
percentage: number;

@Length(3, 255)
description: string;

@IsDate()
@Type(() => Date)
date: Date;

@IsOptional()
optionalField?: string;

@IsEnum(MyEnum)
status: MyEnum;

@IsArray()
tags: string[];
```

## 🧪 Testes

### Unit Test

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaClient, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should create user', async () => {
    jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
    const result = await service.create(createDto);
    expect(result).toEqual(mockUser);
  });
});
```

### E2E Test

```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/api/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send(createDto)
      .expect(201);
  });
});
```

## 🔧 Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
JWT_SECRET="your-secret-key"
PORT=3000
```

## 📡 Testar API

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'
```

### Requisição Autenticada

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>"
```

## 🎯 Convenções

### Commits

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
refactor: refatoração
test: testes
chore: tarefas gerais
```

### Branches

```
feature/nome-da-feature
fix/nome-do-fix
hotfix/nome-do-hotfix
```

### Arquivos

```
kebab-case.ts
create-user.dto.ts
user.service.ts
```

### Classes/Interfaces

```typescript
PascalCase
UserService
CreateUserDto
```

### Variáveis/Funções

```typescript
camelCase
userName
getUserById()
```

### Constantes

```typescript
UPPER_SNAKE_CASE
MAX_LOGIN_ATTEMPTS
```

## 📚 Links Úteis

- [Documentação Completa](./ARCHITECTURE.md)
- [Guia do Desenvolvedor](./DEVELOPER_GUIDE.md)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Swagger UI](http://localhost:3000/api/docs)
- [Prisma Studio](http://localhost:5555)

## 🆘 Troubleshooting

### Erro de Migration

```bash
# Reset database
npx prisma migrate reset

# Recriar migrations
npx prisma migrate dev
```

### Erro de Cliente Prisma

```bash
# Regenerar cliente
npx prisma generate
```

### Erro de Dependências

```bash
# Limpar e reinstalar
rm -rf node_modules yarn.lock
yarn install
```

### Porta em Uso

```bash
# Mudar porta no .env
PORT=3001
```

---

**Última atualização**: 2026-01-24
