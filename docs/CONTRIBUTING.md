# Contributing - Guia de Contribuição

> Guia completo para contribuir com o desenvolvimento do Opus Atlas

## Bem-vindo ao Opus Atlas!

Agradecemos seu interesse em contribuir para o Opus Atlas! Este documento fornece todas as informações necessárias para começar a contribuir com nossa plataforma educacional de música clássica.

### Tipos de Contribuição

- **🐛 Bug Reports**: Reportar problemas encontrados
- **✨ Feature Requests**: Sugerir novas funcionalidades
- **📝 Documentation**: Melhorar documentação
- **💻 Code**: Contribuir com código
- **🎨 UI/UX**: Melhorias de interface
- **🧪 Testing**: Adicionar testes
- **🌐 Translation**: Tradução de conteúdo

---

## Primeiros Passos

### Pré-requisitos

- **Node.js**: 20.x LTS
- **Git**: Versão mais recente
- **Docker**: Para desenvolvimento com containers
- **Editor**: VS Code recomendado com extensões

### Setup do Ambiente

```bash
# 1. Fork e clone o repositório
git clone https://github.com/SEU_USERNAME/Classical-Music.git
cd Classical-Music

# 2. Instalar dependências
npm install

# 3. Setup ambiente local
cp .env.example .env.local
# Editar .env.local com suas configurações

# 4. Configurar banco local (Docker)
docker-compose up -d mongodb-dev redis

# 5. Setup Prisma
npx prisma generate
npx prisma db push

# 6. Instalar hooks
npm run prepare

# 7. Iniciar desenvolvimento
npm run dev
```

### Estrutura do Projeto

```
Classical-Music/
├── app/                    # Next.js App Router (247 páginas)
│   ├── (admin)/           # Sistema admin
│   ├── (protected)/       # Páginas protegidas
│   ├── (public)/          # Páginas públicas
│   ├── api/               # API Routes (124 rotas)
│   ├── student/           # Sistema do aluno
│   ├── teacher/           # Sistema do professor
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base
│   ├── forms/            # Formulários
│   ├── modals/           # Modais
│   └── layout/           # Layout components
├── lib/                   # Utilitários e configurações
│   ├── auth.ts           # NextAuth config
│   ├── db.ts             # Prisma client
│   ├── redis.ts          # Redis client
│   └── utils.ts          # Funções utilitárias
├── prisma/               # Schema do banco (41 tabelas)
├── types/                # TypeScript definitions
├── public/               # Assets estáticos
└── docs/                 # Documentação
```

---

## Desenvolvimento

### Stack Tecnológico

```yaml
Frontend/Backend:
  - Next.js: 15.3.2 (App Router)
  - React: 19.0.0
  - TypeScript: 5.8.3
  - Tailwind CSS: 4.x
  - Next-Auth: 4.24.11

Database:
  - MongoDB: 7.0 (Replica Set)
  - Prisma ORM: 6.13.0
  - Redis: 7.2 (Cache)

Infrastructure:
  - Docker: 28.4.0
  - Nginx: 1.25-alpine
  - Ubuntu: 24.04.3 LTS
```

### Padrões de Código

#### TypeScript Guidelines

```typescript
// ✅ Boas práticas
interface ComposerProps {
  id: string
  name: string
  epoch: EpochType
  verified?: boolean
}

export function ComposerCard({ id, name, epoch, verified = false }: ComposerProps) {
  return (
    <div className="composer-card">
      {/* Implementation */}
    </div>
  )
}

// ❌ Evitar
function composerCard(props: any) {
  // Implementação sem tipos
}
```

#### React Component Guidelines

```typescript
// ✅ Estrutura recomendada
'use client'

import { useState, useEffect } from 'react'
import { type ComponentProps } from '@/types'

interface MyComponentProps {
  // Props tipadas
}

export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // Hooks no topo
  const [state, setState] = useState<Type>()

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies])

  // Event handlers
  const handleAction = () => {
    // Handler logic
  }

  // Early returns
  if (!data) return <Loading />

  // Main render
  return (
    <div className="component-wrapper">
      {/* JSX */}
    </div>
  )
}
```

#### Tailwind CSS Guidelines

```typescript
// ✅ Classes organizadas por categoria
<div className="
  flex items-center justify-between    // Layout
  w-full max-w-md mx-auto             // Sizing & Spacing
  bg-white border border-gray-200     // Background & Borders
  rounded-lg shadow-sm                // Effects
  text-gray-900 font-medium           // Typography
  hover:shadow-md transition-shadow   // Interactive states
">

// ✅ Responsive design
<div className="
  grid grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3 lg:gap-8
">

// ❌ Evitar classes hardcoded inline
<div style={{ backgroundColor: '#123456' }}>
```

### Naming Conventions

```typescript
// Files & Directories
components / ui / Button.tsx; // PascalCase para components
lib / utils / formatDate.ts; // camelCase para utilities
types / api.ts; // lowercase para types
hooks / useLocalStorage.ts; // camelCase com 'use' prefix

// Variables & Functions
const userData = {}; // camelCase
const API_ENDPOINT = ''; // UPPER_SNAKE_CASE para constants
function handleSubmit() {} // camelCase com verb prefix
const isLoading = false; // boolean com 'is/has/can' prefix

// Types & Interfaces
interface User {} // PascalCase
type ApiResponse<T> = {}; // PascalCase com generics
enum UserRole {} // PascalCase
```

---

## Git Workflow

### Branch Strategy

```bash
main                # Produção (protegida)
├── feature/feat-name     # Novas funcionalidades
├── bugfix/bug-name      # Correções de bugs
├── hotfix/fix-name      # Correções urgentes
└── docs/doc-name        # Atualizações de documentação
```

### Commit Convention

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<type>[optional scope]: <description>

# Tipos
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação (não afeta código)
refactor: refatoração
test: adiciona/modifica testes
chore: tarefas de build/ci

# Exemplos
feat(auth): add OAuth2 Google integration
fix(composer): resolve search pagination issue
docs(api): update endpoint documentation
style(ui): improve button component styling
refactor(db): optimize query performance
test(utils): add unit tests for date helpers
chore(deps): update dependencies
```

### Pre-commit Hooks

O projeto usa Husky + lint-staged para garantir qualidade:

```bash
# Automaticamente executado antes do commit
- ESLint check e fix
- Prettier format
- TypeScript type check
- Audit de segurança (npm audit)
```

---

## Testing Guidelines

### Unit Tests

```typescript
// __tests__/utils/formatDate.test.ts
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('15 de janeiro de 2024');
  });

  it('should handle invalid dates', () => {
    expect(formatDate(new Date('invalid'))).toBe('Data inválida');
  });
});
```

### Component Tests

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick handler', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### API Tests

```typescript
// __tests__/api/composers.test.ts
import { GET } from '@/app/api/composers/route';

describe('/api/composers', () => {
  it('returns composers list', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('composers');
    expect(Array.isArray(data.composers)).toBe(true);
  });
});
```

---

## Contribuindo com Features

### Process de Development

1. **Issue First**: Sempre criar/comentar issue antes
2. **Branch**: Criar branch específica
3. **Development**: Implementar com testes
4. **Testing**: Testar localmente
5. **Documentation**: Atualizar docs se necessário
6. **PR**: Abrir Pull Request

### Feature Development Example

```bash
# 1. Criar issue no GitHub
# Descrever funcionalidade, requisitos, etc.

# 2. Criar branch
git checkout main
git pull origin main
git checkout -b feature/composer-favorites

# 3. Implementar feature
# - Criar componentes necessários
# - Adicionar rotas de API
# - Implementar lógica de negócio
# - Adicionar testes

# 4. Commit seguindo padrões
git add .
git commit -m "feat(composers): add favorites functionality"

# 5. Push e PR
git push origin feature/composer-favorites
# Abrir PR no GitHub
```

---

## Pull Request Guidelines

### PR Template

```markdown
## Descrição

Breve descrição das mudanças implementadas.

## Tipo de mudança

- [ ] Bug fix (correção)
- [ ] Nova feature (funcionalidade)
- [ ] Breaking change (quebra compatibilidade)
- [ ] Documentação

## Como testar

1. Passo 1
2. Passo 2
3. Resultado esperado

## Screenshots (se aplicável)

[Adicionar screenshots da UI]

## Checklist

- [ ] Código segue padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] PR title segue Conventional Commits
```

### Review Process

1. **Automated Checks**: CI/CD deve passar
2. **Code Review**: 1+ aprovação necessária
3. **Testing**: Testar funcionalidade manualmente
4. **Merge**: Squash and merge recomendado

### Review Checklist

- [ ] Código segue padrões estabelecidos
- [ ] Funcionalidade implementada corretamente
- [ ] Testes adequados incluídos
- [ ] Performance não foi impactada
- [ ] Documentação atualizada se necessário
- [ ] UI/UX consistente com design system

---

## Reportando Issues

### Bug Reports

```markdown
**Descrição do Bug**
Descrição clara do problema.

**Passos para Reproduzir**

1. Ir para '...'
2. Clicar em '...'
3. Ver erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**

- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Versão: [version]

**Contexto Adicional**
Qualquer informação adicional.
```

### Feature Requests

```markdown
**Sua feature request está relacionada a um problema?**
Descrição clara do problema.

**Descreva a solução que gostaria**
Descrição clara da funcionalidade desejada.

**Descreva alternativas consideradas**
Outras abordagens consideradas.

**Contexto Adicional**
Screenshots, mockups, referências.
```

---

## Code Style Guidelines

### ESLint Configuration

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### Prettier Configuration

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### EditorConfig

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## Database Guidelines

### Schema Changes

```typescript
// 1. Alterar schema Prisma
model Composer {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  newField    String?  // Nova field sempre opcional inicialmente
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 2. Gerar migration
npx prisma db push

// 3. Atualizar types se necessário
npx prisma generate
```

### Query Optimization

```typescript
// ✅ Boas práticas
const composers = await prisma.composer.findMany({
  select: {
    id: true,
    name: true,
    imageUrl: true,
    // Evitar campos desnecessários
  },
  where: { verified: true },
  orderBy: { name: 'asc' },
  take: 50, // Sempre paginar
  skip: page * 50,
});

// ❌ Evitar
const composers = await prisma.composer.findMany(); // Sem limite/select
```

---

## API Guidelines

### Route Structure

```typescript
// app/api/composers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Validar parâmetros
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;

    // 2. Autenticação se necessário
    const session = await getServerSession();

    // 3. Lógica de negócio
    const composers = await getComposers({ page });

    // 4. Resposta padronizada
    return NextResponse.json({
      success: true,
      data: composers,
      pagination: {
        page,
        total: composers.length,
      },
    });
  } catch (error) {
    // 5. Error handling
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Error Handling

```typescript
// Padronização de erros
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage
throw new APIError('Composer not found', 404, 'COMPOSER_NOT_FOUND');
```

---

## UI/UX Guidelines

### Component Structure

```typescript
// Componente base seguindo padrões
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  className?: string
}

export function Component({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className = ''
}: ComponentProps) {
  return (
    <div
      className={cn(
        'base-styles',
        variants[variant],
        sizes[size],
        {
          'disabled:opacity-50': disabled,
          'animate-pulse': loading
        },
        className
      )}
    >
      {loading ? <Spinner /> : children}
    </div>
  )
}
```

### Accessibility Guidelines

```typescript
// ✅ Acessibilidade
<button
  type="button"
  aria-label="Favoritar compositor"
  aria-pressed={isFavorite}
  onClick={toggleFavorite}
  disabled={loading}
>
  <HeartIcon aria-hidden="true" />
  {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
</button>

// ✅ Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}
```

---

## Performance Guidelines

### Code Splitting

```typescript
// ✅ Lazy loading
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <ComponentSkeleton />,
  ssr: false
})

// ✅ Conditional imports
const AdminPanel = dynamic(() =>
  import('./AdminPanel').then(mod => ({ default: mod.AdminPanel })),
  { ssr: false }
)
```

### Image Optimization

```typescript
// ✅ Next.js Image
import Image from 'next/image'

<Image
  src="/composer/bach.jpg"
  alt="Johann Sebastian Bach"
  width={300}
  height={400}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

---

## Deployment Guidelines

### Environment Configuration

```bash
# .env.local (development)
NODE_ENV=development
DATABASE_URL="mongodb://localhost:27017/opus_atlas_dev"
NEXTAUTH_URL="http://localhost:3000"

# .env.production
NODE_ENV=production
DATABASE_URL="mongodb://prod-connection-string"
NEXTAUTH_URL="https://opusatlas.com.br"
```

### Build Process

```bash
# Build verificado antes do PR
npm run build
npm run type-check
npm run lint
npm test
```

---

## Community Guidelines

### Code of Conduct

- **Seja respeitoso**: Trate todos com respeito e profissionalismo
- **Seja construtivo**: Forneça feedback construtivo e útil
- **Seja colaborativo**: Trabalhe em equipe e ajude outros contribuidores
- **Seja inclusivo**: Bem-vindo a contribuidores de todos os backgrounds

### Communication Channels

- **GitHub Issues**: Para bugs e feature requests
- **GitHub Discussions**: Para discussões gerais
- **Email**: opusatlas@gmail.com para questões específicas

### Recognition

Contribuidores serão reconhecidos:

- **Contributors**: Listados no README
- **Major Contributors**: Menção especial
- **Core Contributors**: Acesso especial ao repositório

---

## FAQ

### Como começar a contribuir?

1. Explore as issues marcadas como "good first issue"
2. Configure seu ambiente de desenvolvimento
3. Faça uma pequena correção ou melhoria
4. Abra seu primeiro PR

### Posso trabalhar em qualquer issue?

Comente na issue indicando interesse antes de começar para evitar trabalho duplicado.

### Como reportar problemas de segurança?

Envie email para opusatlas@gmail.com com detalhes. Não abra issues públicas para vulnerabilidades.

### Minha contribuição precisa incluir testes?

Para novas funcionalidades e bug fixes, sim. Para documentação e pequenas correções, não é obrigatório.

### Como posso melhorar a documentação?

Documentação está na pasta `/docs`. PRs para melhorar clareza, corrigir erros ou adicionar exemplos são bem-vindos.

---

## Recursos Úteis

### Links Importantes

- **Repository**: https://github.com/IagoMartins12/Classical-Music
- **Demo**: https://opusatlas.com.br
- **Documentação**: `/docs` folder
- **Issues**: GitHub Issues tab

### Ferramentas Recomendadas

- **VS Code Extensions**:
  - TypeScript Hero
  - Prettier
  - ESLint
  - Tailwind CSS IntelliSense
  - Prisma

- **Browser Extensions**:
  - React DevTools
  - Redux DevTools (se usar)

### Learning Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Prisma**: https://www.prisma.io/docs

---

## Agradecimentos

Agradecemos a todos os contribuidores que ajudam a tornar o Opus Atlas melhor! Sua contribuição, seja grande ou pequena, faz diferença na educação musical de milhares de pessoas.

Vamos juntos construir a melhor plataforma de música clássica do mundo! 🎼

---

**Mantenedores**: Equipe Opus Atlas  
**Última atualização**: Dezembro 2024  
**Versão do guia**: 1.0
