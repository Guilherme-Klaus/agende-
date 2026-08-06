# 🚀 Agende+

> Sistema SaaS completo de agendamentos online para estabelecimentos, salões, clínicas e profissionais autônomos.

## 📋 Sobre o Projeto
O Agende+ foi desenvolvido para simplificar a gestão de agendamentos, permitindo que lojistas e profissionais gerenciem seus horários, serviços, expediente e clientes de forma prática e moderna. Os clientes finais possuem uma página pública personalizada e intuitiva para marcar horários, com suporte a múltiplos serviços, escolha de profissionais específicos e consulta de histórico via WhatsApp.

---

## ✨ Principais Funcionalidades

- Multi-tenant / Gestão por Estabelecimentos: Cadastro e isolamento de dados por empresa.
- Link Curto Personalizado (Slug): URLs amigáveis para divulgação (ex: [seusite.com/agendar/sua-empresa](https://seusite.com/agendar/sua-empresa)).
- Gestão de Profissionais & Horários Individuais: Cada profissional pode ter sua própria escala de trabalho e folgas.
- Múltiplos Serviços por Agendamento: O cliente pode selecionar mais de um serviço simultaneamente.
- Histórico e Reagendamento do Cliente: O cliente consulta agendamentos anteriores e futuros informando apenas o WhatsApp.
- Personalização Visual e Logo: Escolha de temas de cores e upload de foto de perfil/logo.
- QR Code para Recepção: Geração automática de QR Code direcionando para a página de agendamento do balcão.
- Métricas e CRM: Painel financeiro, ticket médio e base de clientes cadastrados.

---

## 🛠️ Tecnologias Utilizadas

- Front-end: React, TypeScript, Tailwind CSS, Vite, Lucide React, React Router DOM.
- Back-end: Node.js, Express, TypeScript, Prisma ORM, SQLite, JWT, Bcrypt.

---

## ⚙️ Como Executar o Projeto Localmente

Pré-requisitos: Certifique-se de ter o Node.js instalado na sua máquina.

1. Clonar o Repositório:
git clone [https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git](https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git)
cd saas-agendamentos

2. Configurar e Rodar o Back-end:
cd backend
npm install
npx prisma db push
npm run dev
(O servidor rodará na porta 3000)

3. Configurar e Rodar o Front-end (abra outro terminal na pasta raiz):
cd frontend
npm install
npm run dev
(O front-end rodará na porta 5173)

---

## 👨‍💻 Desenvolvedor
Desenvolvido por Guilherme Klaus Pereira.
