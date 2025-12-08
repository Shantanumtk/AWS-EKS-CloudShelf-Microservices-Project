#!/bin/bash
#
# MCP Gateway Setup for Ubuntu 24.04 - FIXED VERSION
# Run this on your jump server
#

set -e

# =============================================================================
# CONFIGURATION - CHANGE THESE
# =============================================================================
JUMP_SERVER_PUBLIC_IP="174.129.240.254"  # Your jump server public IP
GRAFANA_PASSWORD="CloudShelf2025!"        # Your Grafana admin password
NAMESPACE="cloudshelf"                    # Your K8s namespace
# =============================================================================

MCP_DIR="$HOME/mcp-gateway"
MCP_PORT=8080
PROMETHEUS_PORT=9091
GRAFANA_PORT=3000

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

echo "=============================================="
echo "  MCP Gateway Setup - Fixed Version"
echo "=============================================="
echo ""
echo "Jump Server IP: $JUMP_SERVER_PUBLIC_IP"
echo "Namespace: $NAMESPACE"
echo ""

# ------------------------------------------------------------------------------
# Step 1: Install Dependencies
# ------------------------------------------------------------------------------
echo "Step 1: Installing dependencies..."

if ! command -v node &> /dev/null; then
    print_warning "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
print_status "Node.js: $(node --version)"

if ! command -v go &> /dev/null; then
    print_warning "Installing Go..."
    sudo apt-get update
    sudo apt-get install -y golang-go
fi
print_status "Go: $(go version | cut -d' ' -f3)"

# Set up Go paths
mkdir -p "$HOME/go/bin"
if ! grep -q 'export PATH=\$PATH:\$HOME/go/bin' ~/.bashrc; then
    echo 'export PATH=$PATH:$HOME/go/bin' >> ~/.bashrc
fi
export PATH=$PATH:$HOME/go/bin

# ------------------------------------------------------------------------------
# Step 2: Install MCP Servers
# ------------------------------------------------------------------------------
echo ""
echo "Step 2: Installing MCP servers..."

print_warning "Installing mcp-server-kubernetes..."
sudo npm install -g mcp-server-kubernetes
print_status "mcp-server-kubernetes installed"

print_warning "Installing prometheus-mcp-server..."
sudo npm install -g prometheus-mcp-server
print_status "prometheus-mcp-server installed"

print_warning "Installing mcp-grafana..."
GOBIN="$HOME/go/bin" go install github.com/grafana/mcp-grafana/cmd/mcp-grafana@latest
print_status "mcp-grafana installed"

print_warning "Installing mcp-proxy..."
GOBIN="$HOME/go/bin" go install github.com/TBXark/mcp-proxy@latest
print_status "mcp-proxy installed"

# ------------------------------------------------------------------------------
# Step 3: Create Directory Structure
# ------------------------------------------------------------------------------
echo ""
echo "Step 3: Creating directories..."

mkdir -p "$MCP_DIR"
mkdir -p "$MCP_DIR/logs"
mkdir -p "$MCP_DIR/pids"

print_status "Directories created"

# ------------------------------------------------------------------------------
# Step 4: Create Config (without Grafana token for now)
# ------------------------------------------------------------------------------
echo ""
echo "Step 4: Creating configuration..."

cat > "$MCP_DIR/config.json" << EOF
{
  "mcpProxy": {
    "baseURL": "http://${JUMP_SERVER_PUBLIC_IP}:${MCP_PORT}",
    "addr": ":${MCP_PORT}",
    "name": "CloudShelf MCP Gateway",
    "version": "1.0.0"
  },
  "mcpServers": {
    "kubernetes": {
      "type": "stdio",
      "command": "npx",
      "args": ["mcp-server-kubernetes"],
      "env": {
        "KUBECONFIG": "$HOME/.kube/config"
      }
    },
    "prometheus": {
      "type": "stdio",
      "command": "npx",
      "args": ["prometheus-mcp-server"],
      "env": {
        "PROMETHEUS_URL": "http://localhost:${PROMETHEUS_PORT}"
      }
    },
    "grafana": {
      "type": "stdio",
      "command": "$HOME/go/bin/mcp-grafana",
      "args": [],
      "env": {
        "GRAFANA_URL": "http://localhost:${GRAFANA_PORT}",
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": "PLACEHOLDER"
      }
    }
  }
}
EOF

print_status "Config created"

# ------------------------------------------------------------------------------
# Step 5: Create start-portforwards.sh
# ------------------------------------------------------------------------------
echo ""
echo "Step 5: Creating port-forward script..."

cat > "$MCP_DIR/start-portforwards.sh" << 'SCRIPT'
#!/bin/bash
NAMESPACE="cloudshelf"
PROMETHEUS_PORT=9091
GRAFANA_PORT=3000
MCP_DIR="$HOME/mcp-gateway"

# Kill existing port-forwards
pkill -f "kubectl port-forward.*prometheus" 2>/dev/null || true
pkill -f "kubectl port-forward.*grafana" 2>/dev/null || true
sleep 2

echo "Starting port-forwards..."

# Prometheus
kubectl port-forward svc/prometheus ${PROMETHEUS_PORT}:9090 -n ${NAMESPACE} \
    > "$MCP_DIR/logs/prometheus-pf.log" 2>&1 &
echo $! > "$MCP_DIR/pids/prometheus-pf.pid"

# Grafana
kubectl port-forward svc/grafana ${GRAFANA_PORT}:3000 -n ${NAMESPACE} \
    > "$MCP_DIR/logs/grafana-pf.log" 2>&1 &
echo $! > "$MCP_DIR/pids/grafana-pf.pid"

sleep 3

# Verify
if curl -s "http://localhost:${PROMETHEUS_PORT}/-/healthy" > /dev/null; then
    echo "✓ Prometheus running on :${PROMETHEUS_PORT}"
else
    echo "✗ Prometheus failed"
fi

if curl -s "http://localhost:${GRAFANA_PORT}/api/health" > /dev/null; then
    echo "✓ Grafana running on :${GRAFANA_PORT}"
else
    echo "✗ Grafana failed"
fi
SCRIPT

chmod +x "$MCP_DIR/start-portforwards.sh"
print_status "Port-forward script created"

# ------------------------------------------------------------------------------
# Step 6: Create start-gateway.sh
# ------------------------------------------------------------------------------
echo ""
echo "Step 6: Creating gateway start script..."

cat > "$MCP_DIR/start-gateway.sh" << 'SCRIPT'
#!/bin/bash
MCP_DIR="$HOME/mcp-gateway"
export PATH=$PATH:$HOME/go/bin

# Kill existing
pkill -f mcp-proxy 2>/dev/null || true
sleep 2

echo "Starting MCP Gateway..."
nohup "$HOME/go/bin/mcp-proxy" --config "$MCP_DIR/config.json" \
    > "$MCP_DIR/logs/mcp-proxy.log" 2>&1 &
echo $! > "$MCP_DIR/pids/mcp-proxy.pid"

sleep 5

if pgrep -f mcp-proxy > /dev/null; then
    echo "✓ MCP Gateway running"
    echo ""
    echo "Endpoints:"
    echo "  http://$(curl -s ifconfig.me):8080/kubernetes/sse"
    echo "  http://$(curl -s ifconfig.me):8080/prometheus/sse"
    echo "  http://$(curl -s ifconfig.me):8080/grafana/sse"
else
    echo "✗ MCP Gateway failed to start"
    echo "Check logs: cat $MCP_DIR/logs/mcp-proxy.log"
fi
SCRIPT

chmod +x "$MCP_DIR/start-gateway.sh"
print_status "Gateway start script created"

# ------------------------------------------------------------------------------
# Step 7: Create stop-all.sh
# ------------------------------------------------------------------------------
echo ""
echo "Step 7: Creating stop script..."

cat > "$MCP_DIR/stop-all.sh" << 'SCRIPT'
#!/bin/bash
echo "Stopping all MCP services..."
pkill -f "kubectl port-forward.*prometheus" 2>/dev/null || true
pkill -f "kubectl port-forward.*grafana" 2>/dev/null || true
pkill -f mcp-proxy 2>/dev/null || true
rm -f "$HOME/mcp-gateway/pids/"*.pid 2>/dev/null || true
echo "All stopped"
SCRIPT

chmod +x "$MCP_DIR/stop-all.sh"
print_status "Stop script created"

# ------------------------------------------------------------------------------
# Step 8: Create status.sh
# ------------------------------------------------------------------------------
echo ""
echo "Step 8: Creating status script..."

cat > "$MCP_DIR/status.sh" << 'SCRIPT'
#!/bin/bash
echo "MCP Gateway Status"
echo "=================="

if curl -s "http://localhost:9091/-/healthy" > /dev/null 2>&1; then
    echo "Prometheus:  ✓ Running (:9091)"
else
    echo "Prometheus:  ✗ Stopped"
fi

if curl -s "http://localhost:3000/api/health" > /dev/null 2>&1; then
    echo "Grafana:     ✓ Running (:3000)"
else
    echo "Grafana:     ✗ Stopped"
fi

if pgrep -f mcp-proxy > /dev/null 2>&1; then
    echo "MCP Gateway: ✓ Running (:8080)"
else
    echo "MCP Gateway: ✗ Stopped"
fi
SCRIPT

chmod +x "$MCP_DIR/status.sh"
print_status "Status script created"

# ------------------------------------------------------------------------------
# Step 9: Create Grafana token script
# ------------------------------------------------------------------------------
echo ""
echo "Step 9: Creating Grafana token script..."

cat > "$MCP_DIR/create-grafana-token.sh" << SCRIPT
#!/bin/bash
GRAFANA_PORT=3000
GRAFANA_USER="admin"
GRAFANA_PASS="${GRAFANA_PASSWORD}"
MCP_DIR="\$HOME/mcp-gateway"

echo "Creating Grafana Service Account..."

# Check Grafana is accessible
if ! curl -s "http://localhost:\${GRAFANA_PORT}/api/health" > /dev/null; then
    echo "Error: Grafana not accessible. Run ./start-portforwards.sh first"
    exit 1
fi

# Create service account
SA_RESPONSE=\$(curl -s -X POST \\
    "http://\${GRAFANA_USER}:\${GRAFANA_PASS}@localhost:\${GRAFANA_PORT}/api/serviceaccounts" \\
    -H "Content-Type: application/json" \\
    -d '{"name":"mcp-gateway-'"\$(date +%s)"'","role":"Admin"}')

SA_ID=\$(echo "\$SA_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

if [ -z "\$SA_ID" ]; then
    echo "Error creating service account: \$SA_RESPONSE"
    exit 1
fi

echo "Service Account ID: \$SA_ID"

# Create token
TOKEN_RESPONSE=\$(curl -s -X POST \\
    "http://\${GRAFANA_USER}:\${GRAFANA_PASS}@localhost:\${GRAFANA_PORT}/api/serviceaccounts/\${SA_ID}/tokens" \\
    -H "Content-Type: application/json" \\
    -d '{"name":"mcp-token-'"\$(date +%s)"'"}')

TOKEN=\$(echo "\$TOKEN_RESPONSE" | grep -o '"key":"[^"]*"' | cut -d'"' -f4)

if [ -z "\$TOKEN" ]; then
    echo "Error creating token: \$TOKEN_RESPONSE"
    exit 1
fi

echo ""
echo "Token: \$TOKEN"
echo ""

# Update config.json
sed -i "s/PLACEHOLDER/\$TOKEN/" "\$MCP_DIR/config.json"
sed -i "s/glsa_[a-zA-Z0-9_]*/\$TOKEN/" "\$MCP_DIR/config.json"

echo "Config updated with token!"
SCRIPT

chmod +x "$MCP_DIR/create-grafana-token.sh"
print_status "Grafana token script created"

# ------------------------------------------------------------------------------
# Step 10: Create start-all.sh (master script)
# ------------------------------------------------------------------------------
echo ""
echo "Step 10: Creating master start script..."

cat > "$MCP_DIR/start-all.sh" << 'SCRIPT'
#!/bin/bash
MCP_DIR="$HOME/mcp-gateway"

echo "=============================================="
echo "  Starting MCP Gateway Stack"
echo "=============================================="

# Stop everything first
$MCP_DIR/stop-all.sh

# Start port-forwards
$MCP_DIR/start-portforwards.sh

# Start gateway
$MCP_DIR/start-gateway.sh

# Show status
echo ""
$MCP_DIR/status.sh
SCRIPT

chmod +x "$MCP_DIR/start-all.sh"
print_status "Master start script created"

# ------------------------------------------------------------------------------
# Done
# ------------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "  Setup Complete!"
echo "=============================================="
echo ""
echo "  Directory: $MCP_DIR"
echo ""
echo "  NEXT STEPS:"
echo ""
echo "  1. Start port-forwards:"
echo "     $MCP_DIR/start-portforwards.sh"
echo ""
echo "  2. Create Grafana token:"
echo "     $MCP_DIR/create-grafana-token.sh"
echo ""
echo "  3. Start the gateway:"
echo "     $MCP_DIR/start-gateway.sh"
echo ""
echo "  OR run all at once (after step 2):"
echo "     $MCP_DIR/start-all.sh"
echo ""
echo "  4. Check status:"
echo "     $MCP_DIR/status.sh"
echo ""
echo "=============================================="