# hologram-welcome-ai-agent Helm Chart

## Overview

This Helm chart deploys the hologram-welcome-ai-agent application along with the necessary Kubernetes resources.

## Installation

### 1. Lint the Chart

Ensure the chart is correctly formatted:

```bash
helm lint ./deployment/
```

### 2. Render Templates

Preview the generated Kubernetes manifests:

```bash
helm template <release-name> ./deployment/ --namespace <your-namespace>
```

### 3. Dry-Run Installation

Simulate the installation without making changes to your cluster:

```bash
helm install --dry-run --debug <release-name> ./deployment/ --namespace <your-namespace>
```

### 4. Install the Chart

Ensure the target namespace already exists.

```bash
helm upgrade --install <release-name> ./deployment/ --namespace <your-namespace>
```

**Note:**

- `<release-name>` is a name you assign to this deployment instance. It helps Helm track and manage the release.
- Example: If deploying in production, you might use:

  ```bash
  helm upgrade hologram-welcome-prod ./deployments --namespace <your-namespace-prod>
  ```

## 🔐 Managing Enviroments Variables for Helm Deployment

This Helm chart does **not create ConfigMaps or Secrets** containing sensitive variables, in order to comply with security best practices for public repositories.

## Step 1: Create the required ConfigMaps and Secrets

Before installing this chart, you must manually create the following resources in the same namespace where you will deploy the chart.

### a) For the Chatbot component

#### Secret Chatbot

```sh
kubectl create secret generic chatbot-secret \
  --from-literal=OPENAI_API_KEY=sk-xxx \
  --from-literal=PINECONE_API_KEY=pcsk_xxx \
  --from-literal=POSTGRES_PASSWORD=yourpass \
  --from-literal=POSTGRES_USER=postgres \
  --from-literal=POSTGRES_DB_NAME=chatbot_db \
  -n demos
```

#### ConfigMap Chatbot

```sh
  kubectl create configmap chatbot-config \
  --from-literal=APP_PORT="" \
  --from-literal=LOG_LEVEL="" \
  --from-literal=LLM_PROVIDER="" \
  --from-literal=VECTOR_STORE="" \
  --from-literal=VECTOR_INDEX_NAME=chat_index \
  --from-literal=RAG_PROVIDER="" \
  --from-literal=RAG_DOCS_PATH=./docs \
  --from-literal=AGENT_MEMORY_BACKEND="" \
  --from-literal=AGENT_MEMORY_WINDOW=8 \
  --from-literal=REDIS_URL=redis://localhost:6379 \
  --from-literal=AGENT_PROMPT="Hello, I'm Agent!" \
  --from-literal=SERVICE_AGENT_ADMIN_URL="" \
  --from-literal=CREDENTIAL_DEFINITION_ID="" \
  --from-literal=POSTGRES_HOST=services-postgres \
  --from-literal=TOOLS_CONFIG='[{"name":"exampleTools","description":"Query example tool.","endpoint":"https://api.example.us/us/{query}","method":"GET","requiresAuth":false}]' \
  -n demos
```

### b) For the Vs-Agent component

#### Secret Vs-Agent

```sh
kubectl create secret generic vs-agent-secret \
  --from-literal=POSTGRES_PASSWORD=yourpass \
  --from-literal=POSTGRES_USER=postgres \
  -n demos
```

#### ConfigMap Vs-Agent

```sh
kubectl create configmap vs-agent-config \
  --from-literal=AGENT_ENDPOINT= \
  --from-literal=AGENT_INVITATION_IMAGE_URL= \
  --from-literal=AGENT_LABEL="Chatbot VS-Agent" \
  --from-literal=ANONCREDS_SERVICE_BASE_URL= \
  --from-literal=USE_CORS=true \
  --from-literal=EVENTS_BASE_URL= \
  --from-literal=AGENT_INVITATION_BASE_URL= \
  --from-literal=REDIS_HOST=redis \
  --from-literal=POSTGRES_HOST=postgres \
  -n demos
```

### c) For Postgres

#### Secret

```sh
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_PASSWORD=yourpass \
  --from-literal=POSTGRES_USER=postgres \
  --from-literal=POSTGRES_DB_NAME=chatbot_db \
  -n demos
```

---

## Step 2: Reference your ConfigMap/Secret in `values.yaml`

Ensure the `values.yaml` for each component contains the name of the corresponding configmap and secret, for example:

```yaml
chatbot:
  envFrom:
    configMap: chatbot-config
    secret: chatbot-secret
```

---

## Step 3: Install your chart

Now you can install the chart as usual:

```sh
helm install myrelease . -n demos
```

---

> **Note:**  
> If you need to rotate credentials or update any environment variable, just update the corresponding Secret or ConfigMap using `kubectl`, and then restart the affected pods.
