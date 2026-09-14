# 🧁 Cloudnine Doceria — E-commerce, ERP & KDS Operacional de Alta Performance

<div align="center">

![Cloudnine Logo](public/LogoCloudnine.svg)

  <h3>Confeitaria Artesanal de Alta Gastronomia com Engenharia de Software Moderna</h3>

  <p>
    <b>E-commerce PWA + Montador de Bolos em Tempo Real + Painel BI Financiero + KDS de Cozinha</b>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/MUI-Material_UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="MUI" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/PWA-Ready-FF6F00?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
  </p>

</div>

---

## 📌 Visão Geral

A **Cloudnine Doceria** é um ecossistema web full-stack completo e de nível de produção projetado para resolver os maiores gargalos operacionais e de conversão do mercado de docerias artesanais.

O projeto combina uma experiência **B2C fascinante para o cliente** (com personalização de bolos passo a passo e checkout otimizado) a um poderoso **ERP / KDS Operacional B2B** (com análise financeira em tempo real, gestão de insumos, regras de CMV, ponto de equilíbrio e sistema de tela de cozinha Kanban).

---

## 🎨 Psicologia de Produto & Design System (Engenharia de UX)

O projeto foi auditado e construído sob **15+ Leis Psicológicas & Cognitivas de Produto**, garantindo altíssima conversão e acessibilidade:

- 🎯 **Lei de Fitts (Target Accessibility):** Todos os controles touch e botões de CTA possuem áreas mínimas de interação de 44×44px, otimizados para navegação por polegar em mobile.
- ⚡ **Limiar de Doherty (Sub-400ms Feedback):** Mutação de dados com *Optimistic UI* e estados de carregamento skeleton/spinners imediatos, mantendo o fluxo do usuário sem percepção de lentidão.
- 🧠 **Lei de Hick & Tesler (Conservação da Complexidade):** A complexidade matemática da precificação de bolos (fatores de tamanho, limites de recheio e insumos) é absorvida pelo código, apresentando para o cliente apenas escolhas simples e visuais.
- 📐 **Lei de Jakob & Mapeamento Natural:** Navegação contextual por modelo mental consagrado no mercado (carrinho fixo, busca rápida via atalho `Ctrl/Cmd + K`, kanban de pedidos com avanço intuitivo esquerda ➔ direita).
- ✨ **Efeito de Usabilidade Estética:** Design responsivo artesanal com paleta HSL harmoniosa, suporte dinâmico a Dark/Light Mode, glassmorphism e animações fluidas via `Framer Motion`.

---

## ✨ Módulos Principais

### 🛍️ 1. E-commerce B2C & PWA Interativo
- **Cardápio Inteligente:** Busca em tempo real, categorias dinâmicas, badges alérgicos ("Sem Glúten", "Zero Lactose", "Vegano") e ordenação por popularidade/preço.
- **Engenharia de Bolos Personalizados (Custom Cake Builder):** Interface interativa onde o cliente configura tamanho, tipo de massa, combinação de recheios (com trava de segurança por tamanho) e coberturas com preview visual de cor hexadecimal.
- **Clube de Fidelidade & Cupons:** Sistema integrado de acúmulo de pontos por valor gasto e resgate em descontos reais no checkout.
- **PWA (Progressive Web App):** Instalável em dispositivos móveis e desktops, com cache offline de assets estáticos via Workbox Service Worker.

### 📊 2. Painel Administrativo BI (Business Intelligence)
- **Métricas Financeiras Vitais:** Cálculo automático de Receita Líquida, Custo da Mercadoria Vendida (CMV), Margem de Contribuição e Ponto de Equilíbrio Mensal.
- **Gerenciamento de Estoque & Ficha Técnica:** Cadastro de insumos com preço unitário e alerta de nível crítico de estoque.
- **Precificação Automática:** Sugestão de Preço Mínimo com base em margem de lucro alvo e custos fixos operacionais.

### 🍳 3. KDS de Cozinha (Kitchen Display System)
- **Fila de Preparo Kanban:** Separação visual clara de pedidos (*Recebidos ➔ Em Preparo ➔ Prontos para Entrega*).
- **Indicadores de Urgência Operacional:** Cronômetro de tempo de espera com alerta de cor por SLA (*Verde < 15m, Amarelo 15-30m, Vermelho > 30m*).
- **Ficha Rápida do Pedido:** Expansão de detalhes com ingredientes, observações de alergia e personalização de bolos destacados.

---

## 🛠️ Arquitetura & Stack Tecnológica

O código é organizado em **Módulos Independentes (Feature-Based Architecture)** para facilitar manutenção e escalabilidade:

```
src/
├── core/                   # Design system, types, Zustand stores, temas MUI/Tailwind
│   ├── store/              # State management (Cart, Data, UI Stores)
│   ├── theme/              # Tokens de cores HSL, modo escuro/claro
│   ├── types/              # Tipagens estritas TypeScript
│   └── ui/                 # Componentes globais (Header, Layout, SplashScreen, SEO)
├── modules/
│   ├── admin/              # Módulos de gestão (Dashboard BI, Estoque, Bolos, Loja)
│   ├── kitchen/            # Sistema KDS da Cozinha
│   └── shop/               # E-commerce, Cardápio, Montador de Bolo, Checkout
└── App.tsx                 # Roteador principal e inicializador
```

### Tecnologias:
- **Core:** React 18, TypeScript 5, Vite 6
- **Estilização:** Tailwind CSS 4, Material UI (MUI 6), Emotion, Framer Motion
- **Gerenciamento de Estado:** Zustand 5
- **Ícones & Design:** Phosphor Icons React
- **Backend & Database:** Supabase (PostgreSQL + RLS + Client SDK)
- **Integração Backend:** Express / Node Server (`server.ts`) com Mercado Pago API e Cloudinary
- **AI Copilot:** Google Gemini 2.5/3.0 Flash para automação de copy de marketing

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js `>= 18.0.0`
- npm ou yarn

### 1. Clonar o Repositório
```bash
git clone https://github.com/raphaelbernardolima/cloudnine-doceria.git
cd cloudnine-doceria
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-supabase
VITE_GEMINI_API_KEY=sua-chave-gemini-api
VITE_CLOUDINARY_CLOUD_NAME=seu-cloud-name
VITE_CLOUDINARY_API_KEY=sua-api-key-cloudinary
MERCADOPAGO_ACCESS_TOKEN=seu-token-mercadopago
```

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

### 5. Compilação para Produção & Checagem de Tipos
```bash
# Verificação estática de tipos TypeScript
npx tsc --noEmit

# Bundle de produção (Vite + Service Worker + Node Server)
npm run build
```

---

## 👨‍💻 Autor

Desenvolvido por **Raphael Bernardo**  
- 💼 **LinkedIn:** [linkedin.com/in/raphael-bernardo-lima](https://www.linkedin.com/in/raphael-bernardo-lima)  
- 🐙 **GitHub:** [github.com/raphaelbernardolima](https://github.com/raphaelbernardolima)

---

<div align="center">
  <sub>Construído com carinho, precisão técnica e paixão por confeitaria artesanal 🧁✨</sub>
</div>
