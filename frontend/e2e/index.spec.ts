import { test, expect } from "@playwright/test";

test("トップページが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("TanStack Start FSD Template");
  await expect(page.getByRole("heading", { name: "TanStack Start FSD Template" })).toBeVisible();
});

test("サンプル実装（サンプル相性診断）が表示される", async ({ page }) => {
  await page.goto("/sample/match");
  await expect(page.getByRole("heading", { name: "サンプル相性診断" })).toBeVisible();
});
