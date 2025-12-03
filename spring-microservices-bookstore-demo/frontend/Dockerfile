# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Enable standalone Next.js output
ENV NEXT_TELEMETRY_DISABLED=1

# Build with placeholder values (will be replaced at runtime)
ENV NEXT_PUBLIC_API_BASE_URL=__NEXT_PUBLIC_API_BASE_URL__
ENV NEXT_PUBLIC_API_GATEWAY_URL=__NEXT_PUBLIC_API_GATEWAY_URL__
ENV NEXT_PUBLIC_USE_DUMMY_DATA=__NEXT_PUBLIC_USE_DUMMY_DATA__
ENV NEXT_PUBLIC_AWS_REGION=__NEXT_PUBLIC_AWS_REGION__
ENV NEXT_PUBLIC_COGNITO_USER_POOL_ID=__NEXT_PUBLIC_COGNITO_USER_POOL_ID__
ENV NEXT_PUBLIC_COGNITO_CLIENT_ID=__NEXT_PUBLIC_COGNITO_CLIENT_ID__
ENV MINIKUBE_API_HOST=__MINIKUBE_API_HOST__

RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone server
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create entrypoint script
COPY <<'EOF' /app/entrypoint.sh
#!/bin/sh
set -e

echo "Replacing environment variables at runtime..."

# Replace placeholders with actual runtime env vars
find /app/.next -type f \( -name "*.js" -o -name "*.json" \) | while read file; do
  sed -i "s|__NEXT_PUBLIC_API_BASE_URL__|${NEXT_PUBLIC_API_BASE_URL:-}|g" "$file"
  sed -i "s|__NEXT_PUBLIC_API_GATEWAY_URL__|${NEXT_PUBLIC_API_GATEWAY_URL:-}|g" "$file"
  sed -i "s|__NEXT_PUBLIC_USE_DUMMY_DATA__|${NEXT_PUBLIC_USE_DUMMY_DATA:-false}|g" "$file"
  sed -i "s|__NEXT_PUBLIC_AWS_REGION__|${NEXT_PUBLIC_AWS_REGION:-}|g" "$file"
  sed -i "s|__NEXT_PUBLIC_COGNITO_USER_POOL_ID__|${NEXT_PUBLIC_COGNITO_USER_POOL_ID:-}|g" "$file"
  sed -i "s|__NEXT_PUBLIC_COGNITO_CLIENT_ID__|${NEXT_PUBLIC_COGNITO_CLIENT_ID:-}|g" "$file"
  sed -i "s|__MINIKUBE_API_HOST__|${MINIKUBE_API_HOST:-}|g" "$file"
done

echo "Starting server..."
exec node server.js
EOF

RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]