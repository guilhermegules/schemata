import { describe, expect, it } from "vitest";
import DashboardPage from "@/app/page";

describe("Dashboard Page", () => {
  it("test_should_render_dashboard_page_element", async () => {
    // Act
    const page = await DashboardPage();

    // Assert: JSX element is returned with valid structure
    expect(page).toBeDefined();
    expect(page.type).toBe("div");
  });
});
