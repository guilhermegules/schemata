# Schemata 📐

> Self-hosted personal architecture documentation platform integrating Notion notes with interactive Excalidraw diagrams, engineered to run serverless on Google Cloud Platform (GCP) within Always Free tier limits.

---

## 🌟 Key Features

- **Split-Pane Developer Workspace (`/workspace/[pageId]`)**: Real-time Notion documentation reader side-by-side with interactive Excalidraw canvas.
- **Bi-directional Notion Integration**: Reads Notion blocks (`GET /v1/blocks/{pageId}/children`) and synchronizes live Excalidraw embeds back into the Notion page with one click.
- **Chromeless Notion Embed (`/embed/[diagramId]`)**: Zero-chrome, full-viewport Excalidraw view configured with `frame-ancestors 'self' https://www.notion.so` for direct `/embed` inside Notion notes.
- **GCP Serverless Architecture (Always Free Limits)**:
  - **Cloud Run**: Scales to 0 instances (`min-instances=0`) when idle.
  - **Firestore (Native Mode)**: Persists diagram models, serialized element JSON, and sanitized visual appState.
  - **Cloud Storage (GCS)**: Binary image asset offloader preventing Firestore documents from exceeding the 1 MiB ceiling.
- **Security & Admin Whitelist**: Protected dashboard and mutating APIs powered by Auth.js GitHub OAuth with strict `ADMIN_EMAIL` verification.

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in the required variables:

- `NOTION_TOKEN`: Notion Internal Integration Secret
- `NOTION_DATABASE_ID`: Target database storing architecture notes
- `GCP_PROJECT_ID`: Google Cloud Platform Project ID
- `GCS_BUCKET_NAME`: Bucket for binary assets
- `AUTH_SECRET`: Random 32-character string (`openssl rand -base64 32`)
- `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET`: GitHub OAuth application credentials
- `ADMIN_EMAIL`: Single allowed administrator email

### 2. Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run test suite
npm test

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## ☁️ GCP Deployment (Cloud Run)

Ensure `gcloud` CLI is logged in and configured:

```bash
chmod +x scripts/deploy-gcp.sh
./scripts/deploy-gcp.sh
```

### Manual CLI Commands

1. **Enable GCP APIs**:
```bash
gcloud services enable run.googleapis.com firestore.googleapis.com storage.googleapis.com secretmanager.googleapis.com
```

2. **Deploy to Cloud Run (Always Free Configuration)**:
```bash
gcloud run deploy schemata \
  --source=. \
  --region=us-east1 \
  --min-instances=0 \
  --max-instances=2 \
  --memory=512Mi \
  --cpu=1 \
  --port=8080 \
  --allow-unauthenticated
```
