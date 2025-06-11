# 🦙 Installing Ollama and Llama3 (Linux/Mac)

This guide explains how to install [Ollama](https://ollama.com/) and the Llama3 model, and how to expose Ollama on all interfaces (0.0.0.0) for use with Docker or other systems.

---

## 1. Install Ollama

### **On Linux (Debian/Ubuntu)**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### **On Mac (macOS Intel/Apple Silicon)**

```bash
brew install ollama
```

If you don't have Homebrew, install it from <https://brew.sh/>

---

## 2. Start Ollama

### Default (local only)

```bash
ollama serve
```

### Expose Ollama on all interfaces (0.0.0.0)

> **Why?**  
> To allow access from Docker or other machines, you may want Ollama to listen on all network interfaces.

```bash
OLLAMA_HOST=0.0.0.0 ollama serve
```

- **Tip:** By default, Ollama listens only on `localhost`. Setting `OLLAMA_HOST=0.0.0.0` makes it accessible from other devices and Docker containers.

---

## 3. Pull the Llama3 Model

```bash
ollama pull llama3
```

- This command downloads the Llama3 model. You can also pull other models available in Ollama.

---

## 4. (Optional) Run Ollama in Docker

If you prefer to run Ollama inside a Docker container, here's an example:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: chatbot-ollama
    restart: always
    ports:
      - '11435:11434'
    environment:
      - OLLAMA_HOST=0.0.0.0
    command: >
      /bin/sh -c "ollama serve & sleep 3 && ollama pull llama3 && wait"
```

This will expose Ollama on `http://localhost:11435` (mapped from the container's `11434`).

---

## 5. Test the Ollama API

Try this from your terminal to check if it's working:

```bash
curl http://localhost:11434/api/generate   -X POST   -H "Content-Type: application/json"   -d '{
    "model": "llama3",
    "prompt": "Say hello world"
  }'
```

You should get a response from the model.

---

**That’s it!**  
Ollama + Llama3 is ready for your AI agent setup.
