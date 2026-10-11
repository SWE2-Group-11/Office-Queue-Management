import { test, expect, type Page, type Response } from '@playwright/test';

/*
E2E for Story 1 - Get ticket: real browser + real frontend + real backend on a freshly
seeded in-memory SQLite database (see playwright.config.ts).
Seeded services: 1 deposit, 2 shipping, 3 account_management.
The page logs in as the shared "device" account by itself before loading the services.
The backend answers POST /api/v1/tickets with { code: "S<service_id> - <n>" }.
*/

const TICKETS = '**/api/v1/tickets';

const isTicketPost = (r: Response) => r.url().endsWith('/api/v1/tickets') && r.request().method() === 'POST';
const isServicesGet = (r: Response) => r.url().endsWith('/api/v1/services') && r.request().method() === 'GET';

// The service cards show the service name as a level-3 heading
const card = (page: Page, name: string) => page.getByRole('heading', { level: 3, name, exact: true }).first();

const openList = async (page: Page) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'What do you need help with?' })).toBeVisible();
  await expect(card(page, 'Deposit')).toBeVisible();
};

const confirmButton = (page: Page) => page.getByRole('button', { name: 'Confirm & Get Ticket' });

// Picks a service, confirms, and returns the ticket response the server sent
const takeTicket = async (page: Page, serviceName: string) => {
  await card(page, serviceName).click();
  await expect(page.getByRole('heading', { name: 'Confirm Your Service Selection' })).toBeVisible();
  const [response] = await Promise.all([page.waitForResponse(isTicketPost), confirmButton(page).click()]);
  return response;
};

test('the service list comes from the backend', async ({ page }) => {
  const [services] = await Promise.all([page.waitForResponse(isServicesGet), page.goto('/')]);

  expect(services.status()).toBe(200);
  expect(await services.json()).toEqual([
    { id: 1, tag_name: 'deposit' },
    { id: 2, tag_name: 'shipping' },
    { id: 3, tag_name: 'account_management' },
  ]);
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Deposit', 'Shipping', 'Account Management']);
  await expect(page.getByText('services available')).toBeVisible();
});

test('a customer picks a service, confirms and sees the code the server issued', async ({ page }) => {
  await openList(page);

  const response = await takeTicket(page, 'Shipping');

  expect(response.request().postDataJSON()).toEqual({ service_id: 2 });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toEqual({ code: expect.stringMatching(/^S2 - \d+$/) });

  await expect(page.getByRole('heading', { name: 'Ticket Issued Successfully!' })).toBeVisible();
  await expect(page.getByText(body.code, { exact: true })).toBeVisible();
});

test('"Cancel" sends no ticket request', async ({ page }) => {
  let ticketPosts = 0;
  page.on('request', (r) => {
    if (r.url().endsWith('/api/v1/tickets') && r.method() === 'POST') ticketPosts++;
  });
  await openList(page);

  await card(page, 'Deposit').click();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByRole('heading', { name: 'Confirm Your Service Selection' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'What do you need help with?' })).toBeVisible();
  expect(ticketPosts).toBe(0);
});

test('"Done" returns to the service list', async ({ page }) => {
  await openList(page);
  await takeTicket(page, 'Deposit');
  await expect(page.getByRole('heading', { name: 'Ticket Issued Successfully!' })).toBeVisible();

  await page.getByRole('button', { name: 'Done' }).click();

  await expect(page.getByRole('heading', { name: 'What do you need help with?' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Deposit', 'Shipping', 'Account Management']);
  await expect(page.getByRole('heading', { name: 'Ticket Issued Successfully!' })).toBeHidden();
});

test('two customers get different tickets', async ({ page }) => {
  const codes: string[] = [];
  for (let i = 0; i < 2; i++) {
    await openList(page);
    const response = await takeTicket(page, 'Deposit');
    const { code } = await response.json();
    await expect(page.getByText(code, { exact: true })).toBeVisible();
    codes.push(code);
  }

  expect(codes[1]).not.toBe(codes[0]);
  const number = (code: string) => Number(code.split(' - ')[1]);
  expect(number(codes[1])).toBe(number(codes[0]) + 1);
});

test('when the ticket request fails the customer sees an error and NO ticket', async ({ page }) => {
  await page.route(TICKETS, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ code: 500, name: 'InternalServerError', message: 'An unexpected error occurred' }),
    }),
  );
  await openList(page);

  await card(page, 'Deposit').click();
  await confirmButton(page).click();

  await expect(page.getByText('An unexpected error occurred')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ticket Issued Successfully!' })).toBeHidden();
  await expect(page.getByText('Your Ticket Code')).toBeHidden();
  await expect(page.getByText(/S\d+ - \d+/)).toHaveCount(0);
});
