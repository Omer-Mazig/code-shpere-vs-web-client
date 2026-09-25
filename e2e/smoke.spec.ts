import { test, expect, type Locator, type Page } from "@playwright/test";

const apiUrl = process.env.E2E_API_URL ?? "http://localhost:3000";
const email = process.env.E2E_EMAIL ?? "sarah@example.com";
const password = process.env.E2E_PASSWORD ?? "Password123!";

async function isApiUp(page: Page): Promise<boolean> {
  try {
    const response = await page.request.get(`${apiUrl}/api/health`, {
      timeout: 5_000,
    });
    return response.ok();
  } catch {
    return false;
  }
}

async function likeFirstFeedPost(page: Page, post: Locator) {
  const likeButton = post.getByRole("button", { name: /^(Like|Unlike),/ });
  await expect(likeButton).toBeVisible();

  const label = (await likeButton.getAttribute("aria-label")) ?? "";
  if (label.startsWith("Unlike")) {
    const unliked = page.waitForResponse(
      (response) =>
        response.url().includes("/api/interactions/likes") &&
        response.request().method() === "DELETE" &&
        response.ok(),
    );
    await likeButton.click();
    await unliked;
    await expect(likeButton).toHaveAttribute("aria-label", /^Like,/);
  }

  const liked = page.waitForResponse(
    (response) =>
      response.url().includes("/api/interactions/likes") &&
      response.request().method() === "POST" &&
      response.ok(),
  );
  await likeButton.click();
  await liked;
  await expect(likeButton).toHaveAttribute("aria-pressed", "true");
}

test("sign in, like a post, and comment @smoke", async ({ page }) => {
  test.skip(!(await isApiUp(page)), "Local API is not running");

  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();

  await expect(page).toHaveURL(/\/feed$/);
  await expect(page.getByRole("heading", { name: "Feed" })).toBeAttached();

  const post = page
    .getByRole("article")
    .filter({
      has: page.getByRole("button", { name: /^(Like|Unlike),/ }),
    })
    .first();
  await likeFirstFeedPost(page, post);

  await post.getByRole("button", { name: /^Comments,/ }).click();
  await expect(page).toHaveURL(/\/feed\/[^/]+$/);

  const comment = `Playwright smoke ${Date.now()}`;
  await page.getByRole("combobox", { name: "Add a comment" }).fill(comment);

  const commented = page.waitForResponse(
    (response) =>
      response.url().includes("/api/interactions/comments") &&
      response.request().method() === "POST" &&
      response.ok(),
  );
  await page.getByRole("button", { name: "Comment", exact: true }).click();
  await commented;

  await expect(page.getByText(comment)).toBeVisible();
});
