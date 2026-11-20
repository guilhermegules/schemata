import { AppStatePersisted } from "@/types/diagram";

export const DEFAULT_APP_STATE: AppStatePersisted = {
  viewBackgroundColor: "#ffffff",
  gridSize: null,
  zoom: { value: 1 },
  scrollX: 0,
  scrollY: 0,
};

export function sanitizeAppState(rawState?: Record<string, any> | null): AppStatePersisted {
  if (!rawState) {
    return { ...DEFAULT_APP_STATE };
  }

  const zoomValue =
    typeof rawState.zoom === "object" && rawState.zoom !== null && typeof rawState.zoom.value === "number"
      ? rawState.zoom.value
      : typeof rawState.zoom === "number"
        ? rawState.zoom
        : 1;

  return {
    viewBackgroundColor: typeof rawState.viewBackgroundColor === "string" ? rawState.viewBackgroundColor : "#ffffff",
    gridSize: typeof rawState.gridSize === "number" ? rawState.gridSize : null,
    zoom: { value: Number.isFinite(zoomValue) ? zoomValue : 1 },
    scrollX: typeof rawState.scrollX === "number" && Number.isFinite(rawState.scrollX) ? rawState.scrollX : 0,
    scrollY: typeof rawState.scrollY === "number" && Number.isFinite(rawState.scrollY) ? rawState.scrollY : 0,
  };
}
