# Sistema de Cardápio para Cafeteria

Sistema web completo de cardápio digital para cafeteria com área de pedidos para usuários e painel administrativo com diferentes níveis de acesso.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Context API** - Gerenciamento de estado

## ✨ Funcionalidades

### Área do Cliente
- ✅ Visualização do cardápio com categorias (Cafés, Bebidas, Doces, Salgados)
- ✅ Filtro por categoria
- ✅ Carrinho de compras interativo
- ✅ Finalização de pedidos com dados do cliente
- ✅ Visualização de pedidos realizados
- ✅ Interface responsiva e amigável

### Área Administrativa
- ✅ Sistema de autenticação
- ✅ 3 níveis de acesso: Admin, Gerente e Atendente
- ✅ Gerenciamento de pedidos (visualizar, atualizar status)
- ✅ Gerenciamento de cardápio (adicionar, editar, remover itens)
- ✅ Controle de disponibilidade de itens
- ✅ Dashboard com estatísticas

## 🎨 Design

- Interface minimalista em **preto e branco**
- Layout limpo e moderno
- Experiência de usuário otimizada
- Totalmente responsivo

## 👥 Níveis de Acesso

### Administrador (Admin)
- Acesso total ao sistema
- Gerenciar usuários
- Gerenciar cardápio
- Gerenciar pedidos
- Configurações do sistema

**Credenciais:**
- Email: `admin@cafeteria.com`
- Senha: `admin123`

### Gerente
- Gerenciar cardápio (criar, editar, remover itens)
- Gerenciar pedidos
- Configurações

**Credenciais:**
- Email: `gerente@cafeteria.com`
- Senha: `gerente123`

### Atendente
- Visualizar e atualizar status dos pedidos
- Acesso limitado apenas à gestão de pedidos

**Credenciais:**
- Email: `atendente@cafeteria.com`
- Senha: `atendente123`

## 📦 Instalação

1. Clone o repositório ou navegue até a pasta do projeto

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra o navegador em [http://localhost:3000](http://localhost:3000)

## 📱 Páginas

- `/` - Cardápio principal
- `/checkout` - Finalização de pedido
- `/pedidos` - Pedidos do usuário
- `/login` - Login administrativo
- `/admin` - Dashboard administrativo
- `/admin/pedidos` - Gerenciamento de pedidos
- `/admin/cardapio` - Gerenciamento de cardápio

## 🏗️ Estrutura do Projeto

```
├── app/
│   ├── admin/          # Páginas administrativas
│   ├── checkout/       # Finalização de pedido
│   ├── login/          # Autenticação
│   ├── pedidos/        # Pedidos do usuário
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página inicial
│   └── globals.css     # Estilos globais
├── components/         # Componentes reutilizáveis
│   ├── Cart.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── MenuGrid.tsx
│   └── MenuItemCard.tsx
├── context/            # Contextos React
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── data/               # Dados de exemplo
│   └── menuItems.ts
└── types.ts            # Definições de tipos TypeScript
```

## 🎯 Funcionalidades em Detalhes

### Sistema de Carrinho
- Adicionar/remover itens
- Ajustar quantidades
- Cálculo automático do total
- Persistência durante a navegação

### Gerenciamento de Pedidos
- Visualização em tempo real
- Status: Pendente → Preparando → Pronto → Entregue
- Opção de cancelamento
- Histórico de pedidos

### Gerenciamento de Cardápio
- Cadastro de novos itens
- Edição de itens existentes
- Controle de disponibilidade
- Organização por categorias
- Formatação de preços

## 🔒 Autenticação

O sistema utiliza autenticação simples baseada em Context API. Em produção, recomenda-se implementar:
- JWT ou sessões seguras
- Hash de senhas (bcrypt)
- Integração com backend real
- Validação de tokens

## 📝 Próximos Passos

Para levar este projeto para produção, considere:

1. **Backend**: Implementar API REST ou GraphQL
2. **Banco de Dados**: PostgreSQL, MongoDB ou Firebase
3. **Autenticação Real**: NextAuth.js ou Auth0
4. **Pagamentos**: Integração com Stripe ou Mercado Pago
5. **Imagens**: Upload e otimização de imagens dos produtos
6. **Notificações**: Push notifications para novos pedidos
7. **Relatórios**: Dashboard com gráficos e análises
8. **PWA**: Transformar em Progressive Web App

## 📄 Licença

Este projeto é de código aberto e está disponível para uso educacional e comercial.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

Desenvolvido com ❤️ para facilitar a gestão de cafeterias
