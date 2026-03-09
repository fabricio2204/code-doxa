# Sistema de Gerenciamento de Categorias

## O que foi implementado

Foi criado um sistema completo para o admin gerenciar categorias de produtos dinamicamente. Agora você pode adicionar, editar e remover categorias sem precisar modificar código.

## Arquivos criados

### 1. Backend/Database
- `backend/supabase-categories-schema.sql` - Schema SQL para criar a tabela de categorias no Supabase

### 2. API Routes
- `app/api/categories/route.ts` - GET (listar) e POST (criar) categorias
- `app/api/categories/[id]/route.ts` - GET, PUT (atualizar) e DELETE (remover) categoria específica

### 3. Interface Admin
- `app/admin/categorias/page.tsx` - Página de gerenciamento de categorias
- Adicionado card "Categorias" no painel admin (`app/admin/page.tsx`)

## Como usar

### Passo 1: Configurar o Supabase

1. Acesse o Supabase SQL Editor
2. Execute o script `backend/supabase-categories-schema.sql`
3. Isso criará:
   - Tabela `categories` com campos: id, name, label, emoji, display_order
   - 5 categorias padrão: todos, cafe, bebidas, doces, salgados

### Passo 2: Acessar a interface

1. Faça login no sistema como **gerente** ou **admin**
2. No painel admin, clique no card **"Categorias"**
3. Você verá a lista de categorias existentes

### Passo 3: Gerenciar categorias

#### Adicionar nova categoria:
1. Clique em **"Nova Categoria"**
2. Preencha os campos:
   - **ID**: identificador interno (ex: `lanches`) - sem espaços ou caracteres especiais
   - **Nome**: nome interno (ex: `lanches`)
   - **Label**: nome para exibição (ex: `Lanches`)
   - **Emoji**: emoji representativo (ex: `🍔`)
   - **Ordem de Exibição**: número para ordenar (categorias com menor número aparecem primeiro)
3. Clique em **"Salvar"**

#### Editar categoria:
1. Clique no ícone de lápis (✏️) na categoria desejada
2. Modifique os campos (exceto o ID que não pode ser alterado)
3. Clique em **"Salvar"**

#### Remover categoria:
1. Clique no ícone de lixeira (🗑️) na categoria desejada
2. Confirme a exclusão
3. **Nota**: Não é possível remover categorias que possuem produtos associados

## Proteções e regras

- A categoria **"Todos"** não pode ser editada ou deletada (é usada para filtro "ver tudo")
- Não é possível deletar categorias que ainda possuem produtos
- Apenas gerentes e admins podem acessar essa funcionalidade
- IDs de categorias devem ser únicos

## Endpoints da API

### GET `/api/categories`
Retorna todas as categorias ordenadas por `display_order`

### POST `/api/categories`
Cria nova categoria
```json
{
  "id": "lanches",
  "name": "lanches",
  "label": "Lanches",
  "emoji": "🍔",
  "display_order": 5
}
```

### GET `/api/categories/[id]`
Retorna uma categoria específica

### PUT `/api/categories/[id]`
Atualiza uma categoria existente
```json
{
  "label": "Novo Nome",
  "emoji": "🥪",
  "display_order": 3
}
```

### DELETE `/api/categories/[id]`
Remove uma categoria (se não tiver produtos associados)

## Próximos passos (opcional)

Para que as categorias sejam completamente dinâmicas em todo o sistema, seria necessário:

1. Atualizar `MenuGrid.tsx` para buscar categorias da API
2. Atualizar `app/admin/cardapio/page.tsx` para listar categorias dinamicamente no formulário
3. Modificar o type `MenuItem` em `types.ts` para aceitar qualquer string em `category`
4. Atualizar seed data em `lib/server/supabaseAdmin.ts` para usar apenas categorias existentes

Atualmente as categorias podem ser gerenciadas no admin, mas os componentes do frontend ainda usam as categorias hardcoded. Essas mudanças adicionais tornariam o sistema 100% dinâmico.
