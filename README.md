# 🤖 hologram-welcome-ai-agent-vs

Welcome to **hologram-welcome-ai-agent-vs** – a modular, multi-language AI agent built with NestJS, designed for welcoming users, providing personalized information, and integrating with any LLM, Retrieval Augmented Generation (RAG), and external APIs.

---

## 🚦 Environment Variables

All configuration is managed via environment variables.

**Below is a summary of all supported environment variables and their purpose:**

| Variable Name              | Description                                                                                     | Example Value / Default  |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------ |
| `APP_PORT`                 | Port on which the application runs                                                              | `3000`                   |
| `LOG_LEVEL`                | Log level (`1=error`, `2=warn`, `3=info`, `4=debug`)                                            | `3`                      |
| `AGENT_PROMPT`             | Defines the agent's persona and instructions                                                    | See below for example    |
| `LLM_PROVIDER`             | LLM backend: `openai`, `ollama`, `anthropic`, etc.                                              | `ollama`                 |
| `OPENAI_API_KEY`           | API key for OpenAI (required if using OpenAI)                                                   | `sk-xxx`                 |
| `OPENAI_MODEL`             | OpenAI model to use (e.g., `gpt-3.5-turbo`, `gpt-4`)                                            | `gpt-3.5-turbo`          |
| `OLLAMA_ENDPOINT`          | Ollama endpoint (use container URL if running with Docker Compose)                              | `http://ollama:11435`    |
| `OLLAMA_MODEL`             | Ollama model to use (`llama3`, etc.)                                                            | `llama3`                 |
| `ANTHROPIC_API_KEY`        | API key for Anthropic (Claude)                                                                  |                          |
| `RAG_PROVIDER`             | RAG backend orchestrator: `vectorstore` (custom) or `langchain`                                 | `vectorstore`            |
| `RAG_DOCS_PATH`            | Filesystem path to directory with context documents for RAG ingestion (`.txt` and `.pdf` only). | `/docs`                  |
| `VECTOR_STORE`             | Vector store provider for RAG: `pinecone`, `redis`                                              | `redis`                  |
| `VECTOR_INDEX_NAME`        | Index name for both Pinecone and Redis vector stores                                            | `hologram-ia`            |
| `PINECONE_API_KEY`         | API key for Pinecone vector store                                                               | `pcsk_xxx`               |
| `AGENT_MEMORY_BACKEND`     | Memory backend for chat context: `memory` or `redis`                                            | `redis`                  |
| `AGENT_MEMORY_WINDOW`      | Number of messages stored in chat memory window                                                 | `8`                      |
| `REDIS_URL`                | Redis connection URL for vector store or memory backend                                         | `redis://localhost:6379` |
| `POSTGRES_HOST`            | Hostname/IP for PostgreSQL database                                                             | `postgres`               |
| `POSTGRES_USER`            | Username for PostgreSQL database                                                                | `2060demo`               |
| `POSTGRES_DB_NAME`         | Database name for PostgreSQL                                                                    | `test-service-agent`     |
| `POSTGRES_PASSWORD`        | Password for PostgreSQL                                                                         | `2060demo`               |
| `CREDENTIAL_DEFINITION_ID` | Verifiable credential definition ID or URL                                                      | `http://localhost:3000`  |
| `SERVICE_AGENT_ADMIN_URL`  | Service Agent Admin API URL                                                                     |                          |

**Example `AGENT_PROMPT`:**

```text
You are an AI agent called Karen. You welcome users and provide information about Hologram. Do not reveal you are an AI.
```

---

## 🚀 Overview

**hologram-welcome-ai-agent-vs** is a backend conversational AI agent that serves as the intelligent welcoming agent for Hologram and related ecosystems. The system is designed to:

- **Send a personalized, AI-generated welcome message** when a new user connects.
- **Provide information about Hologram, Verana, and more** via natural conversation.
- **Support authentication-aware features and localizable menus** (“Authenticate” or “Logout” as appropriate, with menu titles personalized per user status).
- **Seamlessly integrate with multiple LLMs** (OpenAI, Ollama, Anthropic) with model/content generation configurable by environment variables.
- **Retrieve contextual knowledge** from local files using RAG (Retrieval Augmented Generation) with Pinecone + LangChain integration.
- **Support session memory** (in-memory or Redis-based), so the agent can remember the context of each user’s conversation.
- **Expose a flexible tools system** for integration with APIs (e.g., statistics, user state, etc.).
- **Operate in multiple languages** (English, Spanish, French out-of-the-box; easily extendable).
- **Centralize all configuration** via `.env` and the NestJS config system.
- **Deploy with Docker Compose** including ready-to-use Redis and Ollama containers.

---

## 🗂️ Project Structure

```sh
src/
  ├── chatbot/        # Core chatbot service, prompt logic, and session handling
  ├── llm/            # LLM provider interface + adapters (OpenAI, Ollama, Anthropic)
  ├── rag/            # RAG services (vector store, document ingestion, context retrieval)
  ├── memory/         # Memory service (in-memory/Redis backends)
  ├── common/         # Utilities, language detection, prompt templates
  ├── main.ts         # Application bootstrap
```

---

## 📝 Bot Conversation Flow Diagram

Below is a high-level flowchart representing how the `CoreService` This diagram summarizes the main states (`START`, `AUTH`, `CHAT`), how messages are handled, and what menu options are available at each step.

![Hologram IA Agent fl](./docs/assets/hologram-ia-flow.png)

---

## 🐳 Running with Docker Compose

You can start the full system (API, Redis, PostgreSQL, and Service Agent) using Docker Compose:

```bash
docker compose up --build
```

This will launch:

- The AI agent backend (NestJS)
- Redis (for chat memory and Service Agent state)
- PostgreSQL (for session and agent storage)
- Service Agent (for DIDComm communication and credential handling)
- Adminer (for browsing the PostgreSQL database)

The chatbot API will be available at [http://localhost:3000](http://localhost:3000)  
The Service Agent will be available at [http://localhost:3001](http://localhost:3001)  
Adminer UI will be accessible at [http://localhost:8080](http://localhost:8080)

### ⚙️ Environment Configuration

Before running the system, you **must create a `.env` file** in the root directory with the required environment variables.

These variables configure:

- LLM provider and API key
- Vector store (e.g., Pinecone)
- RAG configuration and document paths
- Redis and PostgreSQL credentials
- Service Agent communication settings
- Agent prompt and memory configuration

👉 Refer to the [Environment Variables](#-environment-variables) section for the full list of required variables and their purpose.

---

## 📚 API Usage

### POST `/chatbot/ask`

Request:

```json
{
  "question": "What is Hologram?",
  "connectionId": "user-123"
}
```

Response:

```json
{
  "answer": "Hologram is an advanced platform for ..."
}
```

- The agent will respond in the detected language (English, Spanish, or French) automatically.
- Session memory ensures that the context of the conversation is maintained.

## 📚 RAG (Retrieval Augmented Generation) Service Configuration

Full setup and usage instructions for the modular RAG service—including how to configure vector stores (Pinecone, Redis) and RAG providers—are provided in  
[How to use RAG Service](./docs/how-to-use-rag-service.md).

## 🧠 Memory Module Setup

For a full guide on configuring and using the memory module (supporting both in-memory and Redis backends), see  
[How to use the Memory Module](./docs/how-to-use-memory-service.md).

## 📥 Ollama & Llama3 Installation

Full setup instructions for local LLMs (Ollama + Llama3) are provided in [How to use Ollama](./docs/how-to-use-ollama.md).
