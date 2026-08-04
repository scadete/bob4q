# Guia de Configuração do IBM Bob — Qiskit Code Assistant + Ollama

Este guia explica como configurar o IBM Bob com o modelo Qiskit Code Assistant via Ollama para o workshop **bob4q**.

---

## Pré-requisitos

| Ferramenta | Versão | Instalação |
|------------|--------|------------|
| [Bob (extensão IBM para VS Code)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer) | mais recente | VS Code Marketplace |
| [Ollama](https://ollama.com/download) | ≥ 0.3 | ollama.com/download |

---

## 1. Instalar o Ollama

### macOS
```bash
brew install ollama
```

### Windows
Baixe e execute o instalador em [ollama.com/download](https://ollama.com/download).

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

## 2. Baixar o Modelo Granite

O Qiskit Code Assistant é servido pela família de modelos **Granite 3.1** via Ollama:

```bash
ollama pull granite3.1-dense:8b
```

> **Atenção:** O download é de aproximadamente 5 GB. Faça isso antes do workshop para evitar demora.
>
> **Requisito de hardware:** ≥ 8 GB de RAM é recomendado para velocidade de inferência confortável.

Verifique se o modelo está disponível:
```bash
ollama list
```

Você deve ver `granite3.1-dense:8b` na lista.

---

## 3. Iniciar o Servidor MCP

Na raiz do repositório:

```bash
cd mcp-server
uv run server.py
```

Isso inicia o servidor MCP no modo **stdio** — o IBM Bob irá se conectar automaticamente.

---

## 4. Configurar o Bob

O servidor MCP (`explain_circuit`) pode rodar **localmente** na sua própria máquina, ou
**remotamente** em um host compartilhado — a mesma ferramenta em ambos os casos, só muda o
transporte. Aponte a configuração do Bob para o que fizer mais sentido no seu contexto.

### Local (stdio) — um servidor por participante

Abra as configurações do VS Code (`Cmd/Ctrl + ,`) e adicione a configuração do servidor MCP:

```json
{
  "bob.mcpServers": {
    "bob4q": {
      "command": "uv",
      "args": ["run", "python", "server.py"],
      "cwd": "/caminho/para/bob4q/mcp-server"
    }
  }
}
```

Substitua `/caminho/para/bob4q` pelo caminho real deste repositório.

### Remoto (HTTP) — um servidor compartilhado para a sala

Inicie o servidor em modo HTTP no host compartilhado (veja a flag `--http` em
`mcp-server/server.py`):

```bash
cd mcp-server
uv run server.py --http --port 8765
```

Depois aponte o Bob para a URL remota em vez de um comando local:

```json
{
  "bob.mcpServers": {
    "bob4q": {
      "url": "http://<host-compartilhado>:8765/sse"
    }
  }
}
```

Essa é a opção a usar quando o Ollama/Granite é pesado demais para rodar no laptop de cada
participante — hospede uma instância e conecte o Bob de todos a ela.

---

## 5. Verificar a Conexão

Abra o Bob no VS Code e pergunte:

> "Use a ferramenta `explain_circuit` para explicar este circuito: `qc = QuantumCircuit(1); qc.h(0)`."

Você deverá receber de volta uma explicação em linguagem natural sobre a porta Hadamard.

---

## Modo Container (Podman / Docker)

Se preferir não instalar o Ollama localmente, use a pilha de containers:

```bash
podman compose up
```

Isso baixa automaticamente o modelo Granite e inicia todos os serviços. Não é necessário instalar o Ollama localmente.

---

## Solução de Problemas

| Problema | Solução |
|---------|---------|
| `ollama: command not found` | Verifique se o Ollama está instalado e no PATH |
| Falha no download do modelo | Certifique-se de ter conexão estável e ≥ 10 GB de espaço em disco |
| Bob não consegue conectar ao servidor MCP | Verifique se `uv run server.py` está rodando; consulte os logs da extensão Bob no VS Code |
| `explain_circuit` retorna erro | Certifique-se de que `ollama serve` está rodando (`ollama list` deve funcionar) |
