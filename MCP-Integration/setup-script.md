# 1. Stop everything currently running
pkill -f mcp-proxy
pkill -f "kubectl port-forward"

# 2. Delete old setup
rm -rf ~/mcp-gateway

# 3. Download and run new setup script
# (copy mcp-gateway-setup-v2.sh to jump server, then:)
chmod +x ~/mcp-gateway-setup-v2.sh
./mcp-gateway-setup-v2.sh

# 4. Start port-forwards
~/mcp-gateway/start-portforwards.sh

# 5. Create Grafana token
~/mcp-gateway/create-grafana-token.sh

# 6. Start gateway
~/mcp-gateway/start-gateway.sh

# 7. Check status
~/mcp-gateway/status.sh

# 8. Open firewall
sudo ufw allow 8080/tcp
```

### On Your Mac

1. Copy `claude_desktop_config.json` to:
```
   ~/Library/Application Support/Claude/claude_desktop_config.json
```

2. Restart Claude Desktop

3. Look for the hammer icon - you should see kubernetes, prometheus, grafana connected

---

### Test Prompts

After everything is connected:
```
List all pods in cloudshelf namespace
```
```
Query Prometheus for up metrics
```
```
Search dashboards in Grafana