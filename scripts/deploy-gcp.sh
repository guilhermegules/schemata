#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Google Cloud Run & Serverless Infrastructure Deployment for Schemata
# Optimized for GCP Always Free Tier Limits
# Target Region: us-east1
# ==============================================================================

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project)}"
REGION="us-east1"
SERVICE_NAME="schemata"
BUCKET_NAME="${GCS_BUCKET_NAME:-schemata-diagram-assets-${PROJECT_ID}}"

echo "🚀 Deploying Schemata to Google Cloud Platform..."
echo "Project ID: ${PROJECT_ID}"
echo "Region:     ${REGION}"
echo "Bucket:     ${BUCKET_NAME}"

# 1. Enable Required GCP APIs
echo "📦 Enabling required GCP services..."
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  --project="${PROJECT_ID}"

# 2. Create GCS Bucket for Excalidraw binary assets if not exists
echo "🪣 Configuring Google Cloud Storage bucket..."
if ! gcloud storage buckets describe "gs://${BUCKET_NAME}" --project="${PROJECT_ID}" &>/dev/null; then
  gcloud storage buckets create "gs://${BUCKET_NAME}" \
    --project="${PROJECT_ID}" \
    --location="${REGION}" \
    --uniform-bucket-level-access
fi

# 3. Configure GCS CORS (allowing browser read/write)
cat << 'EOF' > /tmp/gcs-cors.json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF

gcloud storage buckets update "gs://${BUCKET_NAME}" \
  --cors-file=/tmp/gcs-cors.json \
  --project="${PROJECT_ID}"
rm -f /tmp/gcs-cors.json

# 4. Provision Firestore Database (Native Mode) if not yet created
echo "🔥 Checking Firestore Database..."
gcloud firestore databases describe --project="${PROJECT_ID}" &>/dev/null || \
gcloud firestore databases create \
  --location="${REGION}" \
  --type=firestore-native \
  --project="${PROJECT_ID}" || true

# 5. Build and Deploy Container to Cloud Run (Always Free Tier limits)
echo "🚀 Building and Deploying to Google Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --source=. \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=2 \
  --memory=512Mi \
  --cpu=1 \
  --port=8080 \
  --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID},GCS_BUCKET_NAME=${BUCKET_NAME},NODE_ENV=production,PORT=8080,HOSTNAME=0.0.0.0"

SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform=managed --region="${REGION}" --project="${PROJECT_ID}" --format='value(status.url)')

echo "✅ Schemata deployed successfully!"
echo "Service URL: ${SERVICE_URL}"
echo "Next step: Set NEXT_PUBLIC_APP_URL=${SERVICE_URL} and add your NOTION_TOKEN and AUTH secrets in Secret Manager or Cloud Run env vars."
