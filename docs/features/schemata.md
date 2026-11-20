# RFC / ADR: Schemata Serverless Architecture Documentation Platform

## Status
**Accepted & Implemented**

## Context & Motivation
Designing and maintaining architecture documentation often fractures between rich text notes (e.g. Notion) and visual system diagrams (e.g. Excalidraw). Engineers either embed static PNGs (which quickly drift out of date) or link to external SaaS diagramming tools with recurring seat fees.

Schemata establishes a self-hosted, serverless architecture documentation platform that connects Notion notes with interactive Excalidraw diagrams, engineered to run strictly within the Google Cloud Platform (GCP) Always Free tier.

---

## Architectural Decisions

### 1. Compute & Packaging
- **Next.js 15 App Router**: Configured with `output: "standalone"` in `next.config.ts`.
- **Google Cloud Run**: Container deployment scaled to 0 instances (`min-instances=0`) when idle, consuming $0 during periods of no traffic.
- **Port & Host**: Runs on `PORT=8080`, `HOSTNAME="0.0.0.0"`.

### 2. Canvas & State Persistence
- **Client-Side Excalidraw**: Loaded with `next/dynamic` (`ssr: false`) to bypass SSR Node canvas constraints.
- **AppState Sanitization**: Strips transient cursor coordinates, active selection, and UI focus, persisting only visual viewport settings (`viewBackgroundColor`, `gridSize`, `zoom`, `scrollX`, `scrollY`).
- **Persistence Pipeline**: Debounced 2000ms auto-save during editing, plus a `visibilitychange` and `beforeunload` beacon flush via `navigator.sendBeacon`.

### 3. Database & Object Storage
- **Google Cloud Firestore (Native Mode)**: Stores diagram documents with UUID primary keys. Enforces strict document size limit safety (< 1 MiB) by offloading pasted binary assets to GCS.
- **Google Cloud Storage (GCS)**: Stores binary images and PNG/SVG snapshots. Mapped via `fileRefs` inside the Firestore document.

### 4. Notion Bi-directional Sync
- **Reader Pane**: Fetches Notion page content and child blocks (`GET /v1/blocks/{pageId}/children`) and renders clean structured blocks.
- **Sync Embed Action**: Upserts an `embed` block pointing to `${NEXT_PUBLIC_APP_URL}/embed/${diagramId}` directly onto the target Notion page.

### 5. Security & Access Control
- **Auth.js v5**: Single-tenant administration protected by GitHub OAuth restricted to `ADMIN_EMAIL`.
- **Notion Iframe Security**: Custom `Content-Security-Policy: frame-ancestors 'self' https://www.notion.so https://notion.so;` allows embedding inside Notion web and desktop clients without cookie/iframe blocking.

---

## Data Model Specification

```typescript
export interface DiagramDocument {
  id: string; // UUID
  title: string;
  notionPageId: string; // Indexed for O(1) page lookup
  elements: readonly any[]; // Serialized Excalidraw elements
  appState: {
    viewBackgroundColor: string;
    gridSize: number | null;
    zoom: { value: number };
    scrollX: number;
    scrollY: number;
  };
  fileRefs: Record<string, {
    fileId: string;
    gcsPath: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

## Verification Proof
- **Type Checking**: Clean pass with zero errors (`tsc --noEmit`).
- **Automated Test Suite**: 18/18 passing tests across 7 test files (`vitest run`).
- **Production Build**: Standalone bundle generated successfully with 6 pre-rendered and dynamic routes.
