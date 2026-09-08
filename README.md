# 🧁 Cloudnine Doceria | E-commerce & ERP Operacional

> Plataforma web de alta performance desenvolvida para a gestão completa e e-commerce de uma confeitaria artesanal, unindo uma experiência de compra interativa para o cliente a um painel administrativo robusto com Business Intelligence (BI).

---

## 🚀 Sobre o Projeto

A **Cloudnine Doceria** nasceu para resolver problemas reais de operação e vendas no comércio de doces artesanais. O sistema foi estruturado para ser um ecossistema completo: do cliente final personalizando um bolo em tempo real até o administrador acompanhando métricas financeiras vitais como Margem de Contribuição, CMV e Ponto de Equilíbrio.

---

## ✨ Principais Funcionalidades

### 🛍️ Para o Cliente (E-commerce & PWA)
* **Cardápio Dinâmico:** Listagem de produtos filtrados por categorias (Brigadeiros, Bolos de Pote, Macarons, etc.).
* **Construtor de Bolos sob Medida (Custom Builder):** Um fluxo interativo passo a passo onde o usuário escolhe tamanho, massa e recheios, com recálculo de preço em tempo real.
* **Clube de Fidelidade:** Sistema de pontuação e benefícios exclusivos para clientes cadastrados.
* **Área do Perfil:** Gestão de dados pessoais, histórico de pedidos e preferências.

### 📊 Para o Administrador (ERP & Gestão)
* **Painel de Business Intelligence (BI):** Visão financeira consolidada com cálculo automático de Receita Líquida, Custo da Mercadoria Vendida (CMV), Margem de Contribuição e Ponto de Equilíbrio mensal.
* **Gestão Operacional:** Controle de estoque, catálogo de produtos, comanda de cozinha e logística de despacho.
* **Marketing e Fidelidade:** Ferramentas integradas para gestão de campanhas e relacionamento.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando uma stack moderna de desenvolvimento web e arquitetura serverless:

* **Frontend:** React, TypeScript, Vite, Tailwind CSS / UI Components personalizados.
* **Backend & Banco de Dados:** Supabase (PostgreSQL com Row Level Security - RLS).
* **Gerenciamento de Estado & Rotas:** React Router DOM, Zustand.
* **Mídia & Upload:** Cloudinary API.
* **Deploy & Infraestrutura:** Vercel (CI/CD contínuo com ambiente de homologação e produção).

---

## 📸 Screenshots

*(Adicione imagens do projeto aqui para seu portfólio)*
- **Cardápio/E-commerce**: `![Shop](/assets/screenshot-shop.png)`
- **Admin BI**: `![Admin](/assets/screenshot-admin.png)`

---

## 🔒 Arquitetura e Segurança

* **Controle de Acesso Baseado em Funções (RBAC):** Sistema hierárquico com separação estrita entre `super_admin`, `admin`, `escritor` e `leitor`.
* **Segurança de Dados:** Políticas de segurança a nível de linha (*Row Level Security - RLS*) aplicadas diretamente no PostgreSQL.
* **PWA & SEO:** Configuração completa de Progressive Web App (PWA) instalável e Otimização para Motores de Busca (SEO) com React Helmet.
* **Inteligência Artificial:** IA Generativa (Google Gemini) integrada ao painel administrativo para automação de copywriting de marketing.
* **Pagamentos:** Integração backend (server.ts) com a API do Mercado Pago.

---

## 🚀 Como Rodar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/raphaelbernardolima/cloudnine-doceria.git
cd cloudnine-doceria
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz baseado no `.env.example`:
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_key_aqui
VITE_GEMINI_API_KEY=sua_gemini_key_aqui
VITE_CLOUDINARY_API_KEY=sua_cloudinary_key_aqui
VITE_CLOUDINARY_CLOUD_NAME=sua_cloudinary_cloud_aqui
VITE_CLOUDINARY_UPLOAD_PRESET=sua_cloudinary_preset_aqui
MERCADOPAGO_ACCESS_TOKEN=seu_mp_token_aqui
```

4. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

## 👨‍💻 Autor

Desenvolvido por **Raphael Bernardo**  
* [LinkedIn](https://www.linkedin.com/in/raphael-bernardo-lima)  
* [GitHub](https://github.com/raphaelbernardolima)
