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

## 🔒 Arquitetura e Segurança

* **Controle de Acesso Baseado em Funções (RBAC):** Sistema hierárquico com separação estrita entre `super_admin`, `admin`, `escritor` e `leitor`.
* **Segurança de Dados:** Políticas de segurança a nível de linha (*Row Level Security - RLS*) aplicadas diretamente no PostgreSQL para garantir que rotas sensíveis e operações de banco sejam rigidamente protegidas.

---

## 👨‍💻 Autor

Desenvolvido por **Raphael Bernardo**  
* [LinkedIn](https://www.linkedin.com/in/raphael-bernardo-lima)  
* [GitHub](https://github.com/raphaelbernardolima)
