# RAG Service – Modular Retrieval Augmented Generation

## Overview

The `RAG Service` is a modular Retrieval Augmented Generation (RAG) implementation, is designed to flexibly support multiple RAG providers and vector store backends, allowing easy switching between them via environment variables. This design enables seamless integration with different technologies without changing your application logic.

---

## Key Features

- **Provider-Agnostic:** Easily switch between different RAG providers (currently, vector-store and langchain).
- **Pluggable Vector Stores:** In LangChain mode, supports both Pinecone and Redis as backends for vector search.
- **Real Embeddings:** Uses production-ready embeddings (e.g., OpenAI) for all backends.
- **Extensible:** Architecture allows adding new providers or vector stores with minimal changes.

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
```

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

### For Direct Vector Store (Custom implementation)

```env
VECTOR_STORE=custom              # Example value, handled by your custom code
... # Other variables as needed
```

---

## How It Works

### 1. Provider Selection

- At startup, the service reads `RAG_PROVIDER`.
  - If `vector-store`, it initializes your custom/document vector search logic.
  - If `langchain`, it reads `VECTOR_STORE` to choose between Pinecone or Redis (both via LangChainJS).

### 2. Embeddings

- Uses real embeddings (like OpenAI) for vectorization, regardless of backend.
- Embeddings provider is chosen/configured via environment variable (e.g., `OPENAI_API_KEY`).

### 3. Document Operations

- You can add documents to the vector store using `.addDocument(id, text)`.
- For RAG queries, `.askWithRag(question)` retrieves similar documents and provides context-aware answers using the configured LLM.
- `.retrieveContext(query)` returns only the relevant context.

---

## Configuration Scenarios

### **A. Use LangChain with Pinecone**

```env
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
   - `askWithRag(question)` — Get a context-aware answer from the LLM using retrieved context.
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

---
