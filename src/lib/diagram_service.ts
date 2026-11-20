import {
  createDiagram,
  getDiagramById,
  getDiagramByNotionPageId,
  updateDiagram,
} from "@/lib/firestore";
import { DiagramDocument, DiagramCreateInput, DiagramUpdateInput } from "@/types/diagram";

export class DiagramService {
  async getById(id: string): Promise<DiagramDocument | null> {
    return getDiagramById(id);
  }

  async getByNotionPageId(notionPageId: string): Promise<DiagramDocument | null> {
    return getDiagramByNotionPageId(notionPageId);
  }

  async create(input: DiagramCreateInput): Promise<DiagramDocument> {
    if (!input.title || !input.notionPageId) {
      throw new Error("Missing required fields: title and notionPageId");
    }
    return createDiagram(input);
  }

  async update(id: string, input: DiagramUpdateInput): Promise<DiagramDocument | null> {
    return updateDiagram(id, input);
  }
}

export const diagramService = new DiagramService();
