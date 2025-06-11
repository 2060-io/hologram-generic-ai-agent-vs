# 🧠 Memory Module Configuration

The application supports a pluggable memory module for chat/session history.  
You can choose between an in-memory backend (fast, simple, ephemeral) and a Redis-backed persistent memory (scalable, multi-instance safe).  
The backend is **fully configurable via environment variables**—no code changes required.

---

## 🔄 Supported Memory Backends

| Backend  | Description                                      | Use Case Example     |
| -------- | ------------------------------------------------ | -------------------- |
| `memory` | In-memory Map (process-local, volatile)          | Development, testing |
| `redis`  | Redis database (persistent, multi-instance safe) | Production, scaling  |

---

## ⚙️ How to Configure

### 1. Choose backend with environment variable

| Variable Name          | Description                                          | Default                  | Example Value            |
| ---------------------- | ---------------------------------------------------- | ------------------------ | ------------------------ |
| `AGENT_MEMORY_BACKEND` | Memory backend: `memory` (in-memory) or `redis`      | `memory`                 | `redis`                  |
| `AGENT_MEMORY_WINDOW`  | Number of messages to keep in session history window | `8`                      | `16`                     |
| `REDIS_URL`            | (Only for `redis`) Redis connection URL              | `redis://localhost:6379` | `redis://localhost:6379` |

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

---

## 🚦 Behavior

- **In-memory mode:**

  - Each instance keeps its own messages in RAM.
  - Memory is lost if the process restarts or scales horizontally.

- **Redis mode:**
  - All instances share the same memory store.
  - Memory persists across restarts and is safe for scaling.

---

## 🛠️ API (Usage Overview)

- `getHistory(sessionId: string): Promise<ChatMessage[]>` — Retrieve the session's message history.
- `addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void>` — Add a message to the session.
- `clear(sessionId: string): Promise<void>` — Clear the session's memory.

(You don't need to change your code when switching backends. The implementation is selected at runtime based on the environment.)\_

---

## 📝 Best Practices

- Use **in-memory** for development, testing, and demos.
- Use **Redis** for production, when deploying multiple instances, or for persistence across restarts.
- Adjust `AGENT_MEMORY_WINDOW` according to your UX needs (e.g., how much chat history to retain per session).
