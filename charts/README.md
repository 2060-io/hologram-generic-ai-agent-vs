# hologram-welcome-ai-agent Helm Chart

## Overview

This Helm chart deploys the `hologram-welcome-ai-agent` application along with the required Kubernetes resources.

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

This chart **does not create ConfigMaps or Secrets** automatically. To comply with security best practices, especially in public repositories, these resources must be created manually before deploying.

---

## Prerequisites: ConfigMaps and Secrets

Create the following Kubernetes resources **in the same namespace** where you’ll deploy the chart.

---

### 📍 a) Chatbot Component

#### Secret

```bash
kubectl create secret generic hologram-welcome-chatbot-secret \
  --from-literal=OPENAI_API_KEY=sk-xxx \
  --from-literal=PINECONE_API_KEY=pcsk_xxx \
  --from-literal=POSTGRES_PASSWORD=yourpass \
  --from-literal=POSTGRES_USER=postgres \
  --from-literal=POSTGRES_DB_NAME=chatbot_db \
  -n your-namespace
```

#### ConfigMap

```bash
kubectl create configmap hologram-welcome-chatbot-config \
  --from-literal=APP_PORT="3000" \
  --from-literal=LOG_LEVEL="info" \
  --from-literal=LLM_PROVIDER="openai" \
  --from-literal=OPENAI_MODEL="gpt-4" \
  --from-literal=VECTOR_STORE="redis" \
  --from-literal=VECTOR_INDEX_NAME="your_vector_index" \
  --from-literal=RAG_PROVIDER="langchain" \
  --from-literal=RAG_DOCS_PATH="/path/to/docs" \
  --from-literal=AGENT_MEMORY_BACKEND="redis" \
  --from-literal=VS_AGENT_STATS_ENABLED=true \
  --from-literal=VS_AGENT_STATS_HOST="activemq-broker.namespace.svc.cluster.local" \
  --from-literal=VS_AGENT_STATS_PORT=61616 \
  --from-literal=VS_AGENT_STATS_QUEUE="your-stats-queue-name" \
  --from-literal=VS_AGENT_STATS_USER="your-username" \
  --from-literal=VS_AGENT_STATS_PASSWORD="your-password" \
  --from-literal=AGENT_MEMORY_WINDOW=40 \
  --from-literal=REDIS_URL="redis://your-redis-host:6379" \
  --from-literal=AGENT_PROMPT="Your custom prompt message goes here. Include detailed behavior, tone, and expected use of tools." \
  --from-literal=VS_AGENT_ADMIN_URL="http://your-vs-agent-host:3000" \
  --from-literal=CREDENTIAL_DEFINITION_ID="your-credential-definition-id" \
  --from-literal=POSTGRES_HOST="your-postgres-host" \
  --from-literal=LLM_TOOLS_CONFIG='[{"name":"toolName","description":"What it does","endpoint":"https://api.example.com","method":"GET","requiresAuth":false}]' \
  --from-literal=STATISTICS_API_URL="http://your-stats-api-host:port/path" \
  --from-literal=STATISTICS_REQUIRE_AUTH=true \
  -n your-namespace
```

---

### 📍 b) Vs-Agent Component

#### Secret Vs-Agent

```bash
kubectl create secret generic hologram-welcome-vs-agent-secret \
  --from-literal=POSTGRES_PASSWORD=yourpass \
  --from-literal=POSTGRES_USER=postgres \
  -n your-namespace
```

#### ConfigMap vs-Agent

```bash
kubectl create configmap hologram-welcome-vs-agent-config \
  --from-literal=AGENT_LOG_LEVEL=info \
  --from-literal=AGENT_WALLET_ID="your-wallet-id" \
  --from-literal=AGENT_WALLET_KEY="your-wallet-key" \
  --from-literal=AGENT_WALLET_KEY_DERIVATION_METHOD=ARGON2I_INT \
  --from-literal=AGENT_PUBLIC_DID='did:web:your-agent-domain.example.com' \
  --from-literal=AGENT_ENDPOINT='wss://your-agent-domain.example.com:443' \
  --from-literal=AGENT_INVITATION_IMAGE_URL='https://your-agent-domain.example.com/static/avatar.png' \
  --from-literal=AGENT_LABEL="Your Agent Label" \
  --from-literal=ANONCREDS_SERVICE_BASE_URL='https://your-service-base-url.example.com' \
  --from-literal=USE_CORS=true \
  --from-literal=EVENTS_BASE_URL='https://your-events-url.example.com' \
  --from-literal=AGENT_INVITATION_BASE_URL='https://your-invitation-base-url.example.com/' \
  --from-literal=REDIRECT_DEFAULT_URL_TO_INVITATION_URL='https://your-redirect-url.example.com/' \
  --from-literal=REDIS_HOST=your-redis-host.namespace \
  --from-literal=POSTGRES_HOST=your-postgres-host.namespace \
  -n your-namespace
```

---

### c) Postgres Component

#### Secret Postgres

```bash
kubectl create secret generic hologram-welcome-postgres-secret \
  --from-literal=POSTGRES_PASSWORD=yourpass \
  --from-literal=POSTGRES_USER=postgres \
  --from-literal=POSTGRES_DB_NAME=chatbot_db \
  -n your-namespace
```

---

### d) Stats Module

#### ConfigMap Stats

```bash
kubectl create configmap hologram-welcome-stats-config \
  --from-literal=DEBUG="3" \
  --from-literal=QUARKUS_HTTP_PORT="8700" \
  --from-literal=COM_MOBIERA_MS_COMMONS_STATS_JMS_QUEUE_NAME="your-stats-queue-name" \
  --from-literal=COM_MOBIERA_MS_COMMONS_STATS_THREADS="1" \
  --from-literal=COM_MOBIERA_MS_COMMONS_STATS_STANDALONE="1" \
  --from-literal=QUARKUS_ARTEMIS_A0_URL="tcp://your-artemis-broker.namespace.svc.cluster.local:61616" \
  --from-literal=QUARKUS_ARTEMIS_A0_USERNAME="your-artemis-username" \
  --from-literal=QUARKUS_DATASOURCE_JDBC_URL="jdbc:postgresql://your-postgres-host.namespace/test-database" \
  --from-literal=QUARKUS_DATASOURCE_USERNAME="your-database-username" \
  -n your-namespace
```

#### Secret Stats

```bash
kubectl create secret generic hologram-welcome-stats-secret \
  --from-literal=QUARKUS_ARTEMIS_A0_PASSWORD='your-artemis-password' \
  --from-literal=QUARKUS_DATASOURCE_PASSWORD='your-database-password' \
  -n your-namespace
```

---

### e) Artemis Component

#### Secret Artemis

```bash
kubectl create secret generic hologram-welcome-artemis-secret \
  --from-literal=ARTEMIS_USER=your-artemis-user \
  --from-literal=ARTEMIS_PASSWORD=your-artemis-password \
  -n your-namespace
```

---

## Referencing ConfigMaps and Secrets in `values.yaml`

Ensure your `values.yaml` correctly references the resources:

```yaml
chatbot:
  envFrom:
    configMap: chatbot-config
    secret: chatbot-secret
```

Apply this pattern for each component accordingly.

---

## Final Notes

- Make sure all ConfigMaps and Secrets exist before installing the Helm chart.
- Validate that values in `values.yaml` match the names of the Kubernetes resources you created.
