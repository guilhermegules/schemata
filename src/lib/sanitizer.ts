import { AppStatePersisted, toNormalizedZoom } from "@/types/diagram";

export const DEFAULT_APP_STATE: AppStatePersisted = {
  viewBackgroundColor: "#ffffff",
  gridSize: null,
  zoom: { value: toNormalizedZoom(1) },
  scrollX: 0,
  scrollY: 0,
};

function extractZoomValue(zoom: unknown): number {
  if (typeof zoom === "object" && zoom !== null && "value" in zoom) {
    const candidate = (zoom as { value: unknown }).value;
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }
  if (typeof zoom === "number" && Number.isFinite(zoom)) {
    return zoom;
  }
  return 1;
}

export function sanitizeAppState(rawState?: Record<string, unknown> | null): AppStatePersisted {
  if (!rawState) {
    return { ...DEFAULT_APP_STATE };
  }

  const zoomNumber = extractZoomValue(rawState.zoom);
  const bgColor = typeof rawState.viewBackgroundColor === "string" ? rawState.viewBackgroundColor : "#ffffff";
  const gridSize = typeof rawState.gridSize === "number" && Number.isFinite(rawState.gridSize) ? rawState.gridSize : null;
  const scrollX = typeof rawState.scrollX === "number" && Number.isFinite(rawState.scrollX) ? rawState.scrollX : 0;
  const scrollY = typeof rawState.scrollY === "number" && Number.isFinite(rawState.scrollY) ? rawState.scrollY : 0;

  return {
    viewBackgroundColor: bgColor,
    gridSize,
    zoom: { value: toNormalizedZoom(zoomNumber) },
    scrollX,
    scrollY,
  };
}
