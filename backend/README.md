# Backend - Sistema de Cardápio (Supabase)

Backend em Express.js usando Supabase (PostgreSQL) para cardápio e pedidos.

## 🚀 Configuração

### 1) Criar projeto no Supabase

1. Crie um projeto no Supabase.
2. No SQL Editor, execute o arquivo `backend/supabase-schema.sql`.

### 2) Configurar variáveis

Use `backend/.env` (local) ou variáveis no Render:

```dotenv
PORT=3333
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### 3) Rodar local

```bash
npm install
npm start
```

## 📡 Endpoints principais

- `GET /health`
- `GET /api/cardapio/items`
- `GET /api/cardapio/items/:id`
- `POST /api/cardapio/items`
- `PUT /api/cardapio/items/:id`
- `DELETE /api/cardapio/items/:id`
- `GET /api/orders`
- `GET /api/orders/my` (header `x-customer-token`)
- `POST /api/orders`
- `PUT /api/orders/:id`

## ☁️ Deploy no Render

Este repositório já possui `render.yaml` preparado.

No Render, configure as env vars:

- `CORS_ORIGINS=https://seu-frontend.vercel.app`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🔁 Migrar dados do SQLite antigo

Se você já tem dados no arquivo `backend/cafeteria.db`, rode:

```bash
npm run migrate:sqlite
```

Para informar outro arquivo SQLite:

```bash
npm run migrate:sqlite -- ./caminho/arquivo.db
```

Esse processo:

- Upsert de `menu_items`
- Upsert de `orders`
- Recria `order_items` para os pedidos migrados
- Sincroniza a sequência de `sequence_number`

## 📝 Observações

- O seed inicial de 19 itens é inserido automaticamente quando a tabela `menu_items` estiver vazia.
- Upload de imagem continua em `backend/public/uploads`.
