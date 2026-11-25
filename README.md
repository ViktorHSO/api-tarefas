<h1 align="center">✅ API de Tarefas</h1>

<p align="center">
  API REST para gerenciar tarefas pessoais, com cadastro, login por token JWT, prioridades, prazos, filtros e um resumo do que está atrasado. Cada usuário só enxerga as próprias tarefas.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring_Boot-4.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Spring_Security-JWT-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white" alt="Spring Security" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <a href="https://github.com/ViktorHSO/api-tarefas/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/ViktorHSO/api-tarefas/ci.yml?branch=main&style=for-the-badge&label=CI" alt="CI" /></a>
</p>

---

## 📖 Sobre o projeto

Projeto pessoal para praticar o desenvolvimento de uma API em Java do jeito que se faz no mercado: camadas bem separadas, autenticação sem sessão, banco versionado com migrations, testes de integração e tudo rodando com um comando no Docker.

## 🚀 Funcionalidades

- ✅ Cadastro e login com **JWT** (a senha é guardada só como hash **BCrypt**)
- ✅ CRUD de tarefas com título, descrição, **prioridade** (`BAIXA`, `MEDIA`, `ALTA`) e **prazo**
- ✅ Status `PENDENTE` → `EM_ANDAMENTO` → `CONCLUIDA`, com a data de conclusão registrada automaticamente
- ✅ Tarefas **atrasadas** calculadas pelo prazo (e que deixam de estar atrasadas ao serem concluídas)
- ✅ Listagem com **filtros** (status, prioridade, só atrasadas), **busca** pelo título, **paginação** e **ordenação**
- ✅ **Resumo** com a quantidade de tarefas por status e quantas estão atrasadas
- ✅ Cada usuário acessa só as próprias tarefas: a tarefa de outra pessoa responde `404`, como se não existisse
- ✅ Erros no padrão **Problem Details (RFC 9457)**, com a mensagem de cada campo inválido
- ✅ Documentação interativa com **Swagger**
- ✅ **Testes** de unidade e de integração rodando no **GitHub Actions**, mais um teste do fluxo completo com MySQL no Docker

## 🛠️ Tecnologias

- **Java 21** e **Spring Boot 4.2**
- **Spring Web MVC**, **Spring Data JPA** (Hibernate) e **Bean Validation**
- **Spring Security** com OAuth2 Resource Server (tokens JWT assinados com HS256)
- **Flyway** para as migrations do banco
- **MySQL** (Docker) e **H2** em memória (desenvolvimento e testes)
- **springdoc-openapi** (Swagger UI)
- **JUnit 5**, **MockMvc** e **AssertJ**
- **Docker**, **Docker Compose** e **GitHub Actions**

## 📂 Estrutura

```
src/main/java/io/github/viktorhso/tarefas/
├── auth/       # cadastro, login e geração do token JWT
├── config/     # segurança, JWT, relógio da aplicação e Swagger
├── erro/       # exceções e tratamento global de erros (Problem Details)
├── tarefa/     # entidade, regras, repositório, serviço e controller das tarefas
└── usuario/    # entidade e repositório de usuários
src/main/resources/
├── application.yml
└── db/migration/   # scripts do Flyway
src/test/java/...   # testes de unidade e de integração
```

## ⚙️ Como rodar

### Com Docker (MySQL)

```bash
copy .env.example .env     # Windows (Mac/Linux: cp .env.example .env)
# preencha o JWT_SECRET no .env (o comando para gerar está no próprio arquivo)
docker compose up --build
```

### Sem Docker (H2 em memória)

Precisa do **JDK 21**. Na pasta do projeto:

```bash
mvnw spring-boot:run       # Windows (Mac/Linux: ./mvnw spring-boot:run)
```

Ou abra no **IntelliJ IDEA** e rode a classe `TarefasApplication`.

Nos dois casos a API sobe em `http://localhost:8080` e a documentação fica em **`http://localhost:8080/swagger-ui.html`**.

### Testes

```bash
mvnw test                  # Windows (Mac/Linux: ./mvnw test)
```

## 📌 Endpoints

🔒 = exige o cabeçalho `Authorization: Bearer <token>`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/registro` | Cria uma conta |
| POST | `/auth/login` | Faz login e devolve o token JWT |
| GET | `/tarefas` 🔒 | Lista as tarefas (`status`, `prioridade`, `atrasadas`, `busca`, `page`, `size`, `sort`) |
| GET | `/tarefas/resumo` 🔒 | Quantidade por status e de atrasadas |
| GET | `/tarefas/{id}` 🔒 | Busca uma tarefa |
| POST | `/tarefas` 🔒 | Cria uma tarefa |
| PUT | `/tarefas/{id}` 🔒 | Atualiza título, descrição, prioridade e prazo |
| PATCH | `/tarefas/{id}/status` 🔒 | Muda o status |
| DELETE | `/tarefas/{id}` 🔒 | Exclui uma tarefa |

### Exemplo de uso

```bash
# 1. Criar conta
curl -X POST http://localhost:8080/auth/registro -H "Content-Type: application/json" \
  -d '{"nome":"Victor","email":"victor@exemplo.com","senha":"minha-senha-forte"}'

# 2. Fazer login (copie o accessToken da resposta)
curl -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" \
  -d '{"email":"victor@exemplo.com","senha":"minha-senha-forte"}'

# 3. Criar uma tarefa
curl -X POST http://localhost:8080/tarefas -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Estudar Spring Security","prioridade":"ALTA","prazo":"2026-12-10"}'

# 4. Ver só as tarefas atrasadas de prioridade alta
curl "http://localhost:8080/tarefas?atrasadas=true&prioridade=ALTA" -H "Authorization: Bearer SEU_TOKEN"
```

Resposta de erro de validação:

```json
{
  "type": "about:blank",
  "title": "Dados inválidos",
  "status": 400,
  "detail": "Um ou mais campos têm valores inválidos.",
  "erros": {
    "titulo": "Informe o título.",
    "prioridade": "Informe a prioridade: BAIXA, MEDIA ou ALTA."
  }
}
```

## 💡 Decisões do projeto

- **JWT sem sessão:** a API não guarda estado de login. O token carrega o id do usuário e expira em 60 minutos (configurável).
- **Mesmo erro para e-mail inexistente e senha errada:** evita que alguém descubra quais e-mails têm conta.
- **Tarefa de outro usuário responde 404, não 403:** quem não é dono nem fica sabendo que aquele id existe.
- **Flyway em vez de `ddl-auto`:** o esquema do banco é versionado em SQL e evolui junto com o código.
- **Datas pelo fuso de São Paulo:** o que é "atrasado" depende do dia local, então a aplicação usa um `Clock` com fuso configurável, e não o fuso do servidor.
- **Busca segura:** `%` e `_` digitados na busca são tratados como texto, não como curingas do `LIKE`.

## 🗺️ Próximos passos

- [ ] Refresh token
- [ ] Etiquetas (tags) para agrupar tarefas
- [ ] Testes com MySQL via Testcontainers
- [ ] Deploy

## 👤 Autor

**Victor Hugo Sousa Oliveira**

[GitHub](https://github.com/ViktorHSO)
