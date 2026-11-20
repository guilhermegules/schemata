import { Firestore } from "@google-cloud/firestore";
import crypto from "crypto";
import { sanitizeAppState } from "@/lib/sanitizer";
import type { DiagramCreateInput, DiagramDocument, DiagramUpdateInput } from "@/types/diagram";

const memoryDb = new Map<string, DiagramDocument>();

function getFirestoreClient(): Firestore | null {
  if (process.env.GCP_PROJECT_ID || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return new Firestore({
        projectId: process.env.GCP_PROJECT_ID,
      });
    } catch {
      return null;
    }
  }
  return null;
}

export async function createDiagram(input: DiagramCreateInput): Promise<DiagramDocument> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const doc: DiagramDocument = {
    id,
    title: input.title,
    notionPageId: input.notionPageId,
    elements: input.elements || [],
    appState: sanitizeAppState(input.appState),
    fileRefs: {},
    createdAt: now,
    updatedAt: now,
  };

  const firestore = getFirestoreClient();
  if (firestore && process.env.NODE_ENV === "production") {
    await firestore.collection("diagrams").doc(id).set(doc);
    return doc;
  }

  memoryDb.set(id, doc);
  return doc;
}

export async function getDiagramById(id: string): Promise<DiagramDocument | null> {
  const firestore = getFirestoreClient();
  if (firestore && process.env.NODE_ENV === "production") {
    const snap = await firestore.collection("diagrams").doc(id).get();
    if (!snap.exists) return null;
    return snap.data() as DiagramDocument;
  }

  return memoryDb.get(id) || null;
}

export async function getDiagramByNotionPageId(
  notionPageId: string
): Promise<DiagramDocument | null> {
  const firestore = getFirestoreClient();
  if (firestore && process.env.NODE_ENV === "production") {
    const query = await firestore
      .collection("diagrams")
      .where("notionPageId", "==", notionPageId)
      .limit(1)
      .get();
    if (query.empty) return null;
    return query.docs[0].data() as DiagramDocument;
  }

  for (const doc of memoryDb.values()) {
    if (doc.notionPageId === notionPageId) {
      return doc;
    }
  }
  return null;
}

export async function updateDiagram(
  id: string,
  input: DiagramUpdateInput
): Promise<DiagramDocument | null> {
  const existing = await getDiagramById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: DiagramDocument = {
    ...existing,
    title: input.title ?? existing.title,
    elements: input.elements ?? existing.elements,
    appState: input.appState
      ? sanitizeAppState({ ...existing.appState, ...input.appState })
      : existing.appState,
    fileRefs: input.fileRefs ? { ...existing.fileRefs, ...input.fileRefs } : existing.fileRefs,
    updatedAt: now,
  };

  const firestore = getFirestoreClient();
  if (firestore && process.env.NODE_ENV === "production") {
    await firestore.collection("diagrams").doc(id).set(updated, { merge: true });
    return updated;
  }

  memoryDb.set(id, updated);
  return updated;
}
