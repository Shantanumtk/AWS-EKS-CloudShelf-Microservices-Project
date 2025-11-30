#!/bin/bash
# push-monitoring-images.sh
# Run this from a machine with internet access to push monitoring images to ECR

set -e

AWS_ACCOUNT_ID="443071119316"
AWS_REGION="us-east-1"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "🔐 Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Create repositories if they don't exist
REPOS=(
  "cloudshelf/prometheus"
  "cloudshelf/grafana"
  "cloudshelf/mongodb-exporter"
  "cloudshelf/kafka-exporter"
  "cloudshelf/postgres-exporter"
  "cloudshelf/busybox"
)

for repo in "${REPOS[@]}"; do
  echo "📦 Creating repository: ${repo}"
  aws ecr create-repository --repository-name ${repo} --region ${AWS_REGION} 2>/dev/null || echo "  (already exists)"
done

# Image mappings: source -> target
declare -A IMAGES
IMAGES["prom/prometheus:v2.47.0"]="cloudshelf/prometheus:v2.47.0"
IMAGES["grafana/grafana:10.2.0"]="cloudshelf/grafana:10.2.0"
IMAGES["percona/mongodb_exporter:0.40.0"]="cloudshelf/mongodb-exporter:0.40.0"
IMAGES["danielqsj/kafka-exporter:v1.7.0"]="cloudshelf/kafka-exporter:v1.7.0"
IMAGES["prometheuscommunity/postgres-exporter:v0.15.0"]="cloudshelf/postgres-exporter:0.15.0"
IMAGES["busybox:1.36"]="cloudshelf/busybox:1.36"

for source in "${!IMAGES[@]}"; do
  target="${IMAGES[$source]}"
  echo ""
  echo "🚀 Processing: ${source} -> ${target}"
  
  echo "  Pulling ${source}..."
  docker pull ${source}
  
  echo "  Tagging as ${ECR_REGISTRY}/${target}..."
  docker tag ${source} ${ECR_REGISTRY}/${target}
  
  echo "  Pushing to ECR..."
  docker push ${ECR_REGISTRY}/${target}
  
  echo "  ✅ Done!"
done

echo ""
echo "=========================================="
echo "✅ All monitoring images pushed to ECR!"
echo "=========================================="
echo ""
echo "Images available:"
for target in "${IMAGES[@]}"; do
  echo "  - ${ECR_REGISTRY}/${target}"
done
