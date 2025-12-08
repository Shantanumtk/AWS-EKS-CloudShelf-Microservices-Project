# MCP Gateway Integration

## Overview

Integration of **Model Context Protocol (MCP)** to enable AI-powered monitoring and management of the CloudShelf microservices application running on AWS EKS. This creates a unified interface allowing Claude AI to interact with Kubernetes, Prometheus, and Grafana through natural language.

## What is MCP?

Model Context Protocol (MCP) is an open protocol developed by Anthropic that standardizes how AI applications connect to external data sources and tools. It provides a secure, controlled way for language models to access and interact with various services, databases, and APIs.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    Local Machine (Mac)                          │
│                                                                 │
│                     Claude Desktop                              │
│               (AI Assistant with MCP Client)                    │
│                           │                                     │
│                           │ mcp-remote (HTTP/SSE)               │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼ Port 8080
┌────────────────────────────────────────────────────────────────┐
│                 Ubuntu Jump Server (AWS EC2)                    │
│                                                                 │
│                    mcp-proxy Gateway                            │
│          (Aggregates 3 MCP Servers on port 8080)                │
│                                                                 │
│      /kubernetes/sse    /prometheus/sse    /grafana/sse         │
│            │                  │                  │              │
│            ▼                  ▼                  ▼              │
│     ┌───────────┐      ┌───────────┐      ┌───────────┐        │
│     │Kubernetes │      │Prometheus │      │  Grafana  │        │
│     │MCP Server │      │MCP Server │      │MCP Server │        │
│     └─────┬─────┘      └─────┬─────┘      └─────┬─────┘        │
│           │                  │                  │               │
│           ▼                  ▼                  ▼               │
│     ~/.kube/config    localhost:9091    localhost:3000         │
│                       (port-forward)    (port-forward)          │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                      AWS EKS Cluster                            │
│                                                                 │
│    Prometheus      Grafana       CloudShelf Microservices       │
└────────────────────────────────────────────────────────────────┘
```

## Components

### 1. MCP Proxy Gateway

- **Project**: TBXark/mcp-proxy
- **Purpose**: Aggregates multiple MCP servers into a single HTTP endpoint
- **Language**: Go
- **Transport**: Server-Sent Events (SSE)

### 2. Kubernetes MCP Server

- **Package**: mcp-server-kubernetes
- **Purpose**: Enables AI to interact with Kubernetes cluster
- **Capabilities**: List pods, get logs, describe resources, apply manifests, scale deployments, execute commands in pods

### 3. Prometheus MCP Server

- **Package**: prometheus-mcp-server
- **Purpose**: Query and analyze Prometheus metrics
- **Capabilities**: Execute PromQL queries, discover metrics, list scrape targets, get metric metadata

### 4. Grafana MCP Server

- **Package**: mcp-grafana
- **Purpose**: Search dashboards, query datasources, manage alerts
- **Capabilities**: Search dashboards, list datasources, query Prometheus via Grafana, manage alert rules, handle incidents

## How It Works

1. **Claude Desktop** connects to the MCP Gateway using `mcp-remote` client over HTTP/SSE

2. **MCP Gateway** (mcp-proxy) receives requests and routes them to the appropriate MCP server based on the endpoint path

3. **MCP Servers** translate natural language requests into:
   - kubectl commands (Kubernetes)
   - PromQL queries (Prometheus)
   - Grafana API calls (Grafana)

4. **Port-forwards** tunnel connections from the jump server to services running inside the EKS cluster

5. **Results** flow back through the same path to Claude, which presents them in a human-readable format

## Installation

### Prerequisites

- Ubuntu 24.04 (Jump Server)
- Node.js 20+
- Go 1.21+
- kubectl configured with EKS access
- Prometheus and Grafana running on EKS

### Jump Server Setup

```bash
# Install MCP servers
sudo npm install -g mcp-server-kubernetes
sudo npm install -g prometheus-mcp-server
go install github.com/grafana/mcp-grafana/cmd/mcp-grafana@latest
go install github.com/TBXark/mcp-proxy@latest

# Start port-forwards
kubectl port-forward svc/prometheus 9091:9090 -n cloudshelf &
kubectl port-forward svc/grafana 3000:3000 -n cloudshelf &

# Start MCP Gateway
mcp-proxy --config config.json
```

### Configuration

**config.json** (Jump Server):

```json
{
  "mcpProxy": {
    "baseURL": "http://<JUMP_SERVER_IP>:8080",
    "addr": ":8080",
    "name": "CloudShelf MCP Gateway",
    "version": "1.0.0"
  },
  "mcpServers": {
    "kubernetes": {
      "type": "stdio",
      "command": "npx",
      "args": ["mcp-server-kubernetes"],
      "env": {
        "KUBECONFIG": "/home/ubuntu/.kube/config"
      }
    },
    "prometheus": {
      "type": "stdio",
      "command": "npx",
      "args": ["prometheus-mcp-server"],
      "env": {
        "PROMETHEUS_URL": "http://localhost:9091"
      }
    },
    "grafana": {
      "type": "stdio",
      "command": "mcp-grafana",
      "args": [],
      "env": {
        "GRAFANA_URL": "http://localhost:3000",
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": "<token>"
      }
    }
  }
}
```

**claude_desktop_config.json** (Local Machine):

```json
{
  "mcpServers": {
    "kubernetes": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://<JUMP_SERVER_IP>:8080/kubernetes/sse", "--allow-http"]
    },
    "prometheus": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://<JUMP_SERVER_IP>:8080/prometheus/sse", "--allow-http"]
    },
    "grafana": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://<JUMP_SERVER_IP>:8080/grafana/sse", "--allow-http"]
    }
  }
}
```

## Usage

### Example Prompts

**Kubernetes:**
```
List all pods in cloudshelf namespace
Get logs from api-gateway pod
Describe the book-service deployment
```

**Prometheus:**
```
Query Prometheus for all targets that are up
Show me CPU usage for all containers
What metrics are available for book-service?
```

**Grafana:**
```
List all dashboards in Grafana
Search for dashboards related to MongoDB
What datasources are configured?
```

**Combined (Multi-MCP):**
```
Give me a complete health check of my CloudShelf application:
1. Check all pod statuses in Kubernetes
2. Query Prometheus for any services that are down
3. List any active alerts in Grafana
```

## Use Cases

| Use Case | Description |
|----------|-------------|
| Health Monitoring | Check application health across all systems simultaneously |
| Incident Response | Correlate pod failures, metric anomalies, and alerts to identify root causes |
| Capacity Planning | Query resource utilization and deployment configurations |
| Daily Operations | Generate status reports and monitor alerts through conversation |
| Troubleshooting | Investigate issues across Kubernetes, metrics, and dashboards |

## Benefits

| Benefit | Description |
|---------|-------------|
| Unified Interface | Single conversational interface for three monitoring tools |
| Natural Language | Query infrastructure using plain English |
| Cross-System Correlation | AI combines data from multiple sources automatically |
| Reduced Context Switching | No need to switch between kubectl, Prometheus UI, and Grafana |
| Faster Troubleshooting | AI investigates issues across all systems simultaneously |

## Technology Stack

| Component | Technology |
|-----------|------------|
| MCP Gateway | mcp-proxy (Go) |
| Kubernetes MCP | mcp-server-kubernetes (Node.js/npm) |
| Prometheus MCP | prometheus-mcp-server (Node.js/npm) |
| Grafana MCP | mcp-grafana (Go) |
| Transport Protocol | SSE (Server-Sent Events) |
| Client Bridge | mcp-remote (Node.js/npm) |
| AI Assistant | Claude Desktop |

## Files

```
~/mcp-gateway/
├── config.json              # MCP proxy configuration
├── start-portforwards.sh    # Start kubectl port-forwards
├── start-gateway.sh         # Start MCP gateway
├── stop-all.sh              # Stop all services
├── status.sh                # Check status
├── create-grafana-token.sh  # Generate Grafana API token
└── logs/                    # Log files
    ├── prometheus-pf.log
    ├── grafana-pf.log
    └── mcp-proxy.log
```

## Summary

The MCP Gateway integration transforms CloudShelf's observability stack into an AI-powered conversational interface. By aggregating Kubernetes, Prometheus, and Grafana MCP servers behind a single gateway, operators can use natural language to monitor, troubleshoot, and manage the entire microservices infrastructure through Claude AI.