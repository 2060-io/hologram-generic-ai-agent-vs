# 🧠 Memory Module Configuration

The application supports a pluggable memory module for chat/session history, surfaced to LangChain via the `LangchainSessionMemory` adapter. You can choose between an in-memory backend (fast, simple, ephemeral) and a Redis-backed persistent memory (scalable, multi-instance safe). The backend is **fully configurable via environment variables or the agent-pack**—no code changes required.

---

## 🔄 Supported Memory Backends

| Backend  | Description                                      | Use Case Example     |
| -------- | ------------------------------------------------ | -------------------- |
| `memory` | In-memory Map (process-local, volatile)          | Development, testing |
| `redis`  | Redis database (persistent, multi-instance safe) | Production, scaling  |

---

## ⚙️ How to Configure

### 1. Choose backend with environment variable or agent-pack

| Variable Name              | Description                                          | Default                  | Example Value            |
| -------------------------- | ---------------------------------------------------- | ------------------------ | ------------------------ |
| `AGENT_MEMORY_BACKEND`     | Memory backend: `memory` (in-memory) or `redis`      | `memory`                 | `redis`                  |
| `AGENT_MEMORY_WINDOW`      | Number of messages to keep in session history window | `8`                      | `16`                     |
| `REDIS_URL`                | (Only for `redis`) Redis connection URL              | `redis://localhost:6379` | `redis://localhost:6379` |
| agent-pack `memory.backend`| Same as `AGENT_MEMORY_BACKEND`                       | `memory`                 | `redis`                  |
| agent-pack `memory.window` | Same as `AGENT_MEMORY_WINDOW`                        | `8`                      | `16`                     |
| agent-pack `memory.redisUrl`| Same as `REDIS_URL`                                 | `redis://localhost:6379` | `redis://localhost:6379` |

---

### 2. Example `.env` for In-Memory Mode (Dev/Local)

```env
AGENT_MEMORY_BACKEND=memory
AGENT_MEMORY_WINDOW=8
```

### 3. Example `.env` for Redis Mode (Production)

```env
AGENT_MEMORY_BACKEND=redis
AGENT_MEMORY_WINDOW=20
REDIS_URL=redis://localhost:6379
```

### 4. Example agent-pack snippet

```yaml
memory:
  backend: redis
  window: 12
  redisUrl: ${REDIS_URL}
```

---

## 🚦 Behavior

- **In-memory mode:**
  - Each instance keeps its own messages in RAM.
  - Memory is lost if the process restarts or scales horizontally.
- **Redis mode:**
  - All instances share the same memory store.
  - Memory persists across restarts and is safe for scaling.
- **LangChain adapter:**
  - `LangchainSessionMemory` reads/writes via `MemoryService`.
  - Uses `connectionId` (sessionId) as the memory key.
  - Stores user messages as `user` and model replies as `system` for replay.
  - The agent prompt uses `MessagesPlaceholder("chat_history")`, matching `memoryKeys`.

---

## 🛠️ API (Usage Overview)

- `getHistory(sessionId: string): Promise<ChatMessage[]>` — Retrieve the session's message history.
- `addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void>` — Add a message to the session.
- `clear(sessionId: string): Promise<void>` — Clear the session's memory.

Switching backends or windows requires no code changes; the implementation is selected at runtime from env or agent-pack values.

---

## 📝 Best Practices

- Use **in-memory** for development, testing, and demos.
- Use **Redis** for production, when deploying multiple instances, or for persistence across restarts.
- Adjust `AGENT_MEMORY_WINDOW` according to your UX needs (e.g., how much chat history to retain per session).
