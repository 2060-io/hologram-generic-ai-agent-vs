# Agent Pack Schema

This document describes the proposed format for _agent packs_. Agent packs make the current Agent Welcome chatbot fully configurable so the same binary can be reused for other conversational agents.

## Goals

- **Single source of truth:** prompts, welcome messages, flows, tools, RAG/memory settings, and integrations live inside one manifest.
- **Backward compatibility:** if `AGENT_PACK_PATH` is not defined or the manifest is invalid, the application falls back to the legacy environment variables.
- **Environment overrides:** any string value can reference `${VAR_NAME}` so deployments can still override critical values at runtime.
- **Early validation:** the loader rejects malformed manifests during startup and surfaces warnings.

## Location and structure

```bash
agent-packs/
  <agent-id>/
    agent-pack.yaml
```

The service reads the directory provided via `AGENT_PACK_PATH`. If it is not set, it defaults to `agent-packs/Agent-welcome`.

## Manifest fields (`agent-pack.yaml`)

| Field          | Type   | Description                                                 |
| -------------- | ------ | ----------------------------------------------------------- |
| `metadata`     | object | Agent identifiers and descriptive data.                     |
| `languages`    | map    | Per-language prompts/messages (`en`, `es`, etc.).           |
| `llm`          | object | Model/provider parameters.                                  |
| `rag`          | object | RAG and vector store settings.                              |
| `memory`       | object | Memory backend/window config.                               |
| `flows`        | object | Flags for welcome/auth/menu behavior.                       |
| `tools`        | object | Dynamic tool JSON and bundled tool settings.                |
| `integrations` | object | External service configuration (VS Agent, stats, DB, etc.). |

### metadata

```yaml
metadata:
  id: Agent-welcome
  displayName: Agent Welcome Agent
  description: >-
    Multilingual welcome agent for the Agent.
  defaultLanguage: en
  tags: [welcome, Agent]
```

### languages

Each entry can define:

- `welcomeMessage`: short greeting sent on connection (supports `{userName}` placeholders).
- `systemPrompt`: persona/instructions for this language.
- `strings`: dictionary of localized literals (menu labels, auth messages, etc.).

### llm

```yaml
llm:
  provider: ${LLM_PROVIDER}
  model: ${OPENAI_MODEL}
  temperature: 0.3
  agentPrompt: |
    You are an AI agent called Karen...
```

### rag

Same knobs as the current env vars:

```yaml
rag:
  provider: vectorstore
  docsPath: ./docs
  remoteUrls: []
  chunkSize: 1000
  chunkOverlap: 200
  vectorStore:
    type: redis
    indexName: Agent-ia
```

### memory

```yaml
memory:
  backend: redis
  window: 8
  redisUrl: ${REDIS_URL}
```

### flows

```yaml
flows:
  welcome:
    enabled: true
    sendOnProfile: true
    templateKey: welcomeMessage
  authentication:
    enabled: true
    credentialDefinitionId: ${CREDENTIAL_DEFINITION_ID}
  menu:
    items:
      - id: authenticate
        labelKey: CREDENTIAL
        action: authenticate
        visibleWhen: unauthenticated
      - id: logout
        labelKey: LOGOUT
        action: logout
        visibleWhen: authenticated
```

`visibleWhen` accepts `always`, `authenticated`, or `unauthenticated`.

### tools

- `dynamicConfig`: JSON string (or literal object) equivalent to `LLM_TOOLS_CONFIG`.
- `bundled`: settings for built-in tools such as the statistics fetcher.

```yaml
tools:
  dynamicConfig: ${LLM_TOOLS_CONFIG}
  bundled:
    statisticsFetcher:
      enabled: true
      endpoint: ${STATISTICS_API_URL}
      requiresAuth: ${STATISTICS_REQUIRE_AUTH}
      defaultStatClass: USER_CONNECTED
      defaultStatEnums:
        - index: 0
          label: default
          value: default
          description: default fallback value
```

### integrations VS_AGENT

```yaml
integrations:
  vsAgent:
    adminUrl: ${VS_AGENT_ADMIN_URL}
    stats:
      enabled: ${VS_AGENT_STATS_ENABLED}
      host: ${VS_AGENT_STATS_HOST}
      port: ${VS_AGENT_STATS_PORT}
      queue: ${VS_AGENT_STATS_QUEUE}
      username: ${VS_AGENT_STATS_USER}
      password: ${VS_AGENT_STATS_PASSWORD}
  postgres:
    host: ${POSTGRES_HOST}
    user: ${POSTGRES_USER}
    password: ${POSTGRES_PASSWORD}
    dbName: ${POSTGRES_DB_NAME}
```

## Value resolution order

1. Load `agent-pack.yaml`.
2. Replace `${VAR}` placeholders with `process.env.VAR` when available.
3. Allow explicit environment variables (e.g., `AGENT_PROMPT`, `LLM_TOOLS_CONFIG`) to override the resulting values.
4. Fall back to hard-coded defaults when neither pack nor env provides a value.

## Compatibility

- The default pack under `agent-packs/Agent-welcome` mirrors the previous Agent Welcome behavior.
- If `AGENT_PACK_PATH` is missing or invalid, a warning is logged and the app continues with legacy env-only configuration.
- Packs can be swapped by mounting a different directory and pointing `AGENT_PACK_PATH` to it (Docker, Kubernetes, etc.).
