# RAG Service – Modular Retrieval Augmented Generation

## Overview

The `RAG Service` is a modular Retrieval Augmented Generation (RAG) layer exposed to the agent as a LangChain tool (`rag_retriever`). It supports multiple providers/backends and is driven entirely by configuration (env vars or agent-pack), so you can switch storage or document sources without code changes.

---

## Key Features

- **Provider-Agnostic:** Switch between `vectorstore` and `langchain` via config.
- **Pluggable Vector Stores:** In LangChain mode, supports Pinecone or Redis.
- **Real Embeddings:** Uses production-ready embeddings (OpenAI by default).
- **Tool-first:** Exposed to the agent as the `rag_retriever` DynamicStructuredTool (built inside `LlmService`).
- **Automatic Document Loading:** On startup, loads `.txt`, `.md`, `.pdf`, `.csv` from `RAG_DOCS_PATH` (or `rag.docsPath` in the agent-pack) and caches remote docs. If no docs are found, a test document is created.
- **Configurable Chunking:** Defaults to `RAG_CHUNK_SIZE=1000`, `RAG_CHUNK_OVERLAP=200`, overridable by env or agent-pack.

---

## Supported Modes & Backends

| RAG Provider (`RAG_PROVIDER`) | Vector Store (`VECTOR_STORE`) | Description                 |
| ----------------------------- | ----------------------------- | --------------------------- |
| `vector-store`                | Custom/Direct                 | Use your own implementation |
| `langchain`                   | `pinecone`                    | Pinecone via LangChain      |
| `langchain`                   | `redis`                       | Redis via LangChain         |

---

## Environment Variables

### General

```env
# RAG provider selection
RAG_PROVIDER=langchain           # or 'vector-store'

# Common embedding config
OPENAI_API_KEY=sk-xxx            # Your OpenAI key (if using OpenAI embeddings)

# Document loading & chunking
RAG_DOCS_PATH=/app/docs
RAG_REMOTE_URLS='["https://example.com/file.pdf","https://example.com/data.csv"]'  # optional
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200
```

- `RAG_DOCS_PATH` is the base folder for local documents and the cache root for remote downloads (`<RAG_DOCS_PATH>/docs`). Agent-pack `rag.docsPath` can override this.
- `RAG_REMOTE_URLS` can be a comma-separated list or JSON array of remote files to fetch; supported extensions: `.txt`, `.md`, `.pdf`, `.csv`.
- `RAG_CHUNK_SIZE` and `RAG_CHUNK_OVERLAP` control how documents are split prior to indexing and are honored by every backend.

### For LangChain (Pinecone)

```env
VECTOR_STORE=pinecone
PINECONE_API_KEY=your-pinecone-key
VECTOR_INDEX_NAME=your-index
```

### For LangChain (Redis)

```env
VECTOR_STORE=redis
REDIS_URL=redis://localhost:6379
VECTOR_INDEX_NAME=my-index
```

> ⚠️ **Important:**  
> If using Redis, you must use **Redis Stack** (with [RediSearch](https://redis.io/docs/interact/search-and-query/)), not just the default Redis image. For Docker Compose:
>
> ```yaml
> redis:
>   image: redis/redis-stack-server:latest
>   ports:
>     - '6379:6379'
> ```

### For Direct Vector Store (Custom implementation)

```env
VECTOR_STORE=custom              # Example value, handled by your custom code
... # Other variables as needed
```

---

## How It Works

### 1. Provider Selection

- At startup, the service reads `RAG_PROVIDER`.
  - If `vectorstore`, it initializes the custom/document vector search logic.
  - If `langchain`, it reads `VECTOR_STORE` to choose Pinecone or Redis (via LangChainJS).

### 2. Embeddings

- Uses OpenAI embeddings by default (requires `OPENAI_API_KEY`), regardless of backend.

### 3. Document Operations

- **Automatic loading:** All `.txt/.md/.pdf/.csv` files in `RAG_DOCS_PATH` (or agent-pack `rag.docsPath`) are indexed on startup. Remote URLs are cached under the same root.
- **Manual addition:** You can add documents to the vector store using `.addDocument(id, text)`.

### 4. Agent Tool Exposure

- The `rag_retriever` tool is created in `LlmService.buildTools()` via `createRagRetrieverTool(ragService)`.
- Agents built with `createToolCallingAgent` can call this tool automatically when the prompt/model decides to retrieve context.

---

## Configuration Scenarios

### **A. Use LangChain with Pinecone**

```env
RAG_DOCS_PATH=/docs
RAG_PROVIDER=langchain
VECTOR_STORE=pinecone
PINECONE_API_KEY=your-pinecone-key
VECTOR_INDEX_NAME=your-index
OPENAI_API_KEY=sk-xxxx
```

- Pinecone is used as the vector DB via LangChainJS.
- Requires a Pinecone account and API key.

### **B. Use LangChain with Redis**

```env
RAG_DOCS_PATH=/docs
RAG_PROVIDER=langchain
VECTOR_STORE=redis
REDIS_URL=redis://localhost:6379
VECTOR_INDEX_NAME=my-index
OPENAI_API_KEY=sk-xxxx
```

- Redis is used as the vector DB via LangChainJS.
- Requires a running Redis instance (local or remote).

### **C. Use Direct/Custom Vector Store**

```env
RAG_PROVIDER=vector-store
VECTOR_STORE=custom    # Any value your custom code recognizes
... # Other required variables
```

- The service will skip LangChain logic and use your own implementation for all vector search and RAG logic.

---

## Usage

1. **Set the environment variables as shown above for your scenario.**
2. **Start your application as usual.** The service will auto-configure itself based on the provider and vector store settings.
3. **Call the API/methods:**
   - `addDocument(id, text)` — Add a document to the vector store.
   - `retrieveContext(query)` — Get only the most relevant snippets from the store.

---

## Extending / Adding More Providers

- To add more RAG providers (like LlamaIndex, Haystack, etc.),

  - Extend the service initialization logic to handle additional cases based on `RAG_PROVIDER`.
  - Implement the required interface/methods for the new provider.

- To add more vector stores under LangChain,
  - Add a new case for your desired backend in the LangChain logic.
  - Install and configure the relevant LangChain integration.

---

## Best Practices

- Always use real embeddings for production deployments.
- Secure your API keys and connection strings.
- Choose the vector store according to your scale and use-case:
  - **Redis:** Fast and simple, great for dev and small scale.
  - **Pinecone:** Cloud-native, scalable for production workloads.
- Separate configuration for each environment (dev, staging, prod) for flexibility.
- Ensure your prompts/agent include the `rag_retriever` tool so the model can ground answers on documents instead of hallucinating.
