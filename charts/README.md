# hologram-welcome-ai-agent Helm Chart

## Overview

This Helm chart deploys the `hologram-welcome-ai-agent` application and all required Kubernetes components: `chatbot`, `vs-agent`, `postgres`, `redis`, `stats`, and `artemis`. It includes preconfigured Ingress definitions based on a global domain.

---

## Installation Guide

### 1. Lint the Chart

Ensure the Helm chart is correctly formatted:

```bash
helm lint ./charts/
```

---

### 2. Render Templates

Preview the generated Kubernetes manifests:

```bash
helm template <release-name> ./charts/ --namespace <your-namespace>
```

---

### 3. Dry-Run Installation

Simulate the installation without modifying your cluster:

```bash
helm install --dry-run --debug <release-name> ./charts/ --namespace <your-namespace>
```

---

### 4. Install the Chart

Ensure the target namespace already exists:

```bash
helm upgrade --install <release-name> ./charts/ --namespace <your-namespace>
```

> **Note:** `<release-name>` is a Helm release identifier. For example:

```bash
helm upgrade hologram-welcome-chart ./charts --namespace <your-namespace-prod>
```

---

### 5. Uninstall the Chart

To uninstall the release:

```bash
helm uninstall hologram-welcome-chart --namespace <your-namespace>
```

---

## Environment Variable Management

All environment variables used by each component are defined inside `values.yaml` under the corresponding section.

At deploy time, these variables are passed to the containers via a `ConfigMap` and/or `Secret`, which must exist in the same namespace prior to installation.

---

## Ingress with Global Domain

All ingress resources use the shared domain defined in `global.domain`. This allows centralized control of subdomain routing per component. Example:

```yaml
host: chatbot.{{ .Values.global.domain }}
tlsSecretName: chatbot.{{ .Values.global.domain }}-cert
```

This pattern is applied to all ingress-enabled components.

---

## Environment Variables by Component

Below is a summary of the environment variables required by each component. All values must be defined under `values.yaml` in their respective `config` or `secret` fields.

### 📦 Chatbot

| Source    | Key                      | Description                      |
| --------- | ------------------------ | -------------------------------- |
| ConfigMap | APP_PORT                 | Port where the chatbot runs      |
| ConfigMap | LOG_LEVEL                | Logging level                    |
| ConfigMap | LLM_PROVIDER             | LLM provider name                |
| ConfigMap | OPENAI_MODEL             | Model name for OpenAI            |
| ConfigMap | VECTOR_STORE             | Vector DB to use                 |
| ConfigMap | VECTOR_INDEX_NAME        | Name of vector index             |
| ConfigMap | RAG_PROVIDER             | RAG implementation used          |
| ConfigMap | RAG_DOCS_PATH            | Path to RAG documents            |
| ConfigMap | AGENT_MEMORY_BACKEND     | Memory backend                   |
| ConfigMap | AGENT_MEMORY_WINDOW      | Memory window size               |
| ConfigMap | VS_AGENT_STATS_ENABLED   | Enable stats fetching            |
| ConfigMap | VS_AGENT_STATS_HOST      | Stats broker host                |
| ConfigMap | VS_AGENT_STATS_PORT      | Broker port                      |
| ConfigMap | VS_AGENT_STATS_QUEUE     | Broker queue name                |
| ConfigMap | VS_AGENT_STATS_USER      | Broker user                      |
| ConfigMap | VS_AGENT_STATS_PASSWORD  | Broker password                  |
| ConfigMap | REDIS_URL                | Redis connection URL             |
| ConfigMap | AGENT_PROMPT             | Custom LLM agent prompt          |
| ConfigMap | VS_AGENT_ADMIN_URL       | VS-Agent admin dashboard URL     |
| ConfigMap | CREDENTIAL_DEFINITION_ID | VC credential definition         |
| ConfigMap | POSTGRES_HOST            | Postgres host URL                |
| ConfigMap | LLM_TOOLS_CONFIG         | LLM tools config (JSON)          |
| ConfigMap | STATISTICS_API_URL       | External statistics API endpoint |
| ConfigMap | STATISTICS_REQUIRE_AUTH  | Require auth on stats            |
| Secret    | OPENAI_API_KEY           | OpenAI API key                   |
| Secret    | POSTGRES_USER            | DB user                          |
| Secret    | POSTGRES_PASSWORD        | DB password                      |
| Secret    | POSTGRES_DB_NAME         | DB name                          |

---

### 📦 Vs-Agent

| Source    | Key                                    | Description               |
| --------- | -------------------------------------- | ------------------------- |
| ConfigMap | AGENT_LOG_LEVEL                        | Log verbosity level       |
| ConfigMap | AGENT_WALLET_ID                        | Wallet ID                 |
| ConfigMap | AGENT_WALLET_KEY                       | Wallet secret key         |
| ConfigMap | AGENT_WALLET_KEY_DERIVATION_METHOD     | Key derivation method     |
| ConfigMap | AGENT_PUBLIC_DID                       | Public DID                |
| ConfigMap | AGENT_ENDPOINT                         | WebSocket endpoint        |
| ConfigMap | AGENT_INVITATION_IMAGE_URL             | Image URL for invitations |
| ConfigMap | AGENT_LABEL                            | Agent display label       |
| ConfigMap | ANONCREDS_SERVICE_BASE_URL             | URL for anoncreds         |
| ConfigMap | USE_CORS                               | Enable CORS               |
| ConfigMap | EVENTS_BASE_URL                        | Events service URL        |
| ConfigMap | AGENT_INVITATION_BASE_URL              | Base URL for invitations  |
| ConfigMap | REDIRECT_DEFAULT_URL_TO_INVITATION_URL | Redirect target           |
| ConfigMap | REDIS_HOST                             | Redis service hostname    |
| ConfigMap | POSTGRES_HOST                          | Postgres service hostname |
| Secret    | POSTGRES_USER                          | DB user                   |
| Secret    | POSTGRES_PASSWORD                      | DB password               |

---

### 📦 Postgres

| Source | Key               | Description              |
| ------ | ----------------- | ------------------------ |
| Secret | POSTGRES_USER     | Postgres DB user         |
| Secret | POSTGRES_PASSWORD | Postgres DB password     |
| Secret | POSTGRES_DB       | Name of the DB to create |

---

### 📦 Stats

| Source    | Key                                         | Description                  |
| --------- | ------------------------------------------- | ---------------------------- |
| ConfigMap | DEBUG                                       | Log level                    |
| ConfigMap | QUARKUS_HTTP_PORT                           | App port                     |
| ConfigMap | COM_MOBIERA_MS_COMMONS_STATS_JMS_QUEUE_NAME | Queue name                   |
| ConfigMap | COM_MOBIERA_MS_COMMONS_STATS_THREADS        | Number of processing threads |
| ConfigMap | COM_MOBIERA_MS_COMMONS_STATS_STANDALONE     | Run in standalone mode       |
| ConfigMap | QUARKUS_ARTEMIS_A0_URL                      | Artemis broker URL           |
| ConfigMap | QUARKUS_ARTEMIS_A0_USERNAME                 | Artemis username             |
| ConfigMap | QUARKUS_DATASOURCE_JDBC_URL                 | JDBC connection string       |
| ConfigMap | QUARKUS_DATASOURCE_USERNAME                 | DB user                      |
| Secret    | QUARKUS_DATASOURCE_PASSWORD                 | DB password                  |
| Secret    | QUARKUS_ARTEMIS_A0_PASSWORD                 | Artemis password             |

---

### 📦 Artemis

| Source | Key              | Description     |
| ------ | ---------------- | --------------- |
| Secret | ARTEMIS_USER     | Broker user     |
| Secret | ARTEMIS_PASSWORD | Broker password |

---

## Final Notes

- Environment variables are mapped dynamically using `envFrom` in the Helm templates.
- Domain configuration for ingress is centralized via `.Values.global.domain`, enabling consistent hostnames and TLS management.

---
