# 🤖 hologram-welcome-ai-agent-vs

Welcome to **hologram-welcome-ai-agent-vs** – a modular, multi-language AI agent built with NestJS, designed for welcoming users, providing personalized information, and integrating with any LLM, Retrieval Augmented Generation (RAG), and external APIs.

---

## 🚦 Environment Variables

All configuration is managed via environment variables.

**Below is a summary of all supported environment variables and their purpose:**

| Variable Name          | Description                                                        | Example Value / Default  |
| ---------------------- | ------------------------------------------------------------------ | ------------------------ |
| `APP_PORT`             | Port on which the application runs                                 | `3000`                   |
| `LOG_LEVEL`            | Log level (`1=error`, `2=warn`, `3=info`, `4=debug`)               | `3`                      |
| `AGENT_PROMPT`         | Defines the agent's persona and instructions                       | See below for example    |
| `LLM_PROVIDER`         | LLM backend: `openai`, `ollama`, `anthropic`, etc.                 | `ollama`                 |
| `OPENAI_API_KEY`       | API key for OpenAI (required if using OpenAI)                      | `sk-xxx`                 |
| `OLLAMA_ENDPOINT`      | Ollama endpoint (use container URL if running with Docker Compose) | `http://ollama:11435`    |
| `OLLAMA_MODEL`         | Ollama model to use (`llama3`, etc.)                               | `llama3`                 |
| `ANTHROPIC_API_KEY`    | API key for Anthropic (Claude)                                     |                          |
| `VECTOR_STORE`         | Vector store provider for RAG (`pinecone`, etc.)                   | `pinecone`               |
| `PINECONE_API_KEY`     | API key for Pinecone vector store                                  | `pcsk_xxx`               |
| `PINECONE_INDEX_NAME`  | Pinecone index name                                                | `hologram-index`         |
| `AGENT_MEMORY_BACKEND` | Memory backend (`memory` or `redis`)                               | `redis`                  |
| `REDIS_URL`            | Redis connection URL                                               | `redis://localhost:6379` |
| `AGENT_MEMORY_WINDOW`  | Number of messages stored in chat memory window                    | `8`                      |
| `RAG_PROVIDER`         | enable switching RAG backend (Langchain or VectorStore)            | `vectorstore`            |

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

## 🐳 Running with Docker Compose

You can start the full system (API, Redis, and Ollama for LLMs) using Docker Compose:

```bash
docker compose up --build
```

This will launch:

- The AI agent backend (NestJS)
- Redis (for chat memory)
- Ollama (local LLM, e.g. Llama3)

The chatbot API will be available on [http://localhost:3000](http://localhost:3000).  
Ollama will be available at [http://localhost:11435](http://localhost:11435).

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

## 📥 Ollama & Llama3 Installation

Full setup instructions for local LLMs (Ollama + Llama3) are provided in [How to use Ollama](./docs/how-to-use-ollama.md).
