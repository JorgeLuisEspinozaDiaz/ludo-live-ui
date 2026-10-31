import { test, expect } from "@playwright/test";

/**
 * E2E del flujo de ronda.
 * Requiere backend + frontend levantados (ver README).
 * Variables: E2E_ADMIN_USER, E2E_ADMIN_PASS, E2E_PLAYER_USER, E2E_PLAYER_PASS, E2E_TENANT
 */
const adminUser = process.env.E2E_ADMIN_USER || "admin";
const adminPass = process.env.E2E_ADMIN_PASS || "admin123";
const playerUser = process.env.E2E_PLAYER_USER || "player";
const playerPass = process.env.E2E_PLAYER_PASS || "player123";
const tenant = process.env.E2E_TENANT || "";

async function login(page: import("@playwright/test").Page, user: string, pass: string) {
  await page.goto("/login");
  if (tenant) await page.getByLabel(/tenant/i).fill(tenant);
  await page.getByLabel(/usuario/i).fill(user);
  await page.getByLabel(/contraseña|password/i).fill(pass);
  await page.getByRole("button", { name: /entrar/i }).click();
  await expect(page).not.toHaveURL(/login/);
}

test.describe("flujo de ronda", () => {
  test("admin abre compras → participante compra → pago → ganador → premio", async ({
    browser,
  }) => {
    test.skip(!process.env.E2E_LIVE, "Set E2E_LIVE=1 with running stack to enable");

    const adminCtx = await browser.newContext();
    const playerCtx = await browser.newContext();
    const admin = await adminCtx.newPage();
    const player = await playerCtx.newPage();

    await login(admin, adminUser, adminPass);
    await admin.goto("/lives");
    await admin.getByRole("button", { name: /nueva|crear/i }).first().click();
    await admin.getByLabel(/título|title/i).fill(`E2E ${Date.now()}`);
    await admin.getByRole("button", { name: /guardar|crear/i }).click();

    // Enter studio of newest live
    await admin.getByRole("link", { name: /estudio|studio|abrir/i }).first().click();
    await admin.getByRole("button", { name: /iniciar/i }).click();
    await admin.getByRole("button", { name: /crear ronda|nueva ronda/i }).click();
    await admin.getByRole("button", { name: /abrir compras/i }).click();
    await expect(admin.getByText(/compras abiertas/i)).toBeVisible();

    const url = admin.url();
    const liveId = url.match(/lives\/([^/]+)/)?.[1];
    expect(liveId).toBeTruthy();

    await login(player, playerUser, playerPass);
    await player.goto(`/lives/${liveId}`);
    await expect(player.getByText(/compras abiertas/i)).toBeVisible();
    await player.getByRole("button", { name: /comprar/i }).first().click();

    await admin.getByRole("button", { name: /registrar pago|pago/i }).first().click();
    await admin.getByLabel(/monto/i).fill("10");
    await admin.getByRole("button", { name: /confirmar|guardar|registrar/i }).click();

    await admin.getByRole("button", { name: /cerrar compras/i }).click();
    await admin.getByRole("button", { name: /declarar|ganador|finalizar/i }).click();
    await admin.getByRole("button", { name: /rojo/i }).first().click();
    await admin.getByRole("button", { name: /confirmar/i }).click();

    await expect(player.getByText(/ganó|premio|puntos/i)).toBeVisible({ timeout: 15000 });

    await adminCtx.close();
    await playerCtx.close();
  });
});
