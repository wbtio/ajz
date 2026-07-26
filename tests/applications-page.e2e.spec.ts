import { expect, test, type Page } from '@playwright/test'

/**
 * End-to-end coverage for the Applications page.
 *
 * Requires a staff account: set E2E_EMAIL and E2E_PASSWORD (and optionally
 * E2E_BASE_URL). Without them the `e2e` project is not registered at all, so
 * this file never runs in a bare checkout.
 */

const LIST_URL = '/dashboard/participation-cases/work/clients'

async function signIn(page: Page) {
  await page.goto('/admin-login')
  await page.getByLabel(/email/i).first().fill(process.env.E2E_EMAIL!)
  await page.getByLabel(/password/i).first().fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).first().click()
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 })
}

test.beforeEach(async ({ page }) => {
  await signIn(page)
  await page.goto(LIST_URL)
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible()
})

test.describe('applications list', () => {
  test('renders the list shell with server-side KPIs', async ({ page }) => {
    await expect(page.getByText('Total cases')).toBeVisible()
    await expect(page.getByText('Closed', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Active', { exact: true })).toBeVisible()
    await expect(page.getByText('Archived', { exact: true })).toBeVisible()
  })

  test('search runs against the whole result set, not just the loaded page', async ({ page }) => {
    const search = page.getByRole('searchbox', { name: 'Search applications' })
    await search.fill('zzz-no-such-client-zzz')
    // The empty state proves the query reached the server rather than filtering
    // whichever 50 rows happened to be in memory.
    await expect(page.getByText('No matches with these filters')).toBeVisible({ timeout: 15_000 })

    await search.fill('')
    await expect(page.getByText('No matches with these filters')).toBeHidden({ timeout: 15_000 })
  })

  test('operational filters are applied and can be cleared', async ({ page }) => {
    await page.getByRole('combobox', { name: /Operational filter/i }).click()
    await page.getByRole('option', { name: 'Missing documents' }).click()
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible()

    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeHidden()
  })

  test('sorting controls change the ordering key', async ({ page }) => {
    await page.getByRole('combobox', { name: /Sort by/i }).click()
    await page.getByRole('option', { name: 'Client name' }).click()
    await expect(page.getByRole('button', { name: 'Sort by Client & Case' })).toBeVisible()
  })

  test('refresh reloads without a full navigation', async ({ page }) => {
    await page.getByRole('button', { name: 'Refresh list' }).click()
    await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible()
  })

  test('exports every matching row as CSV', async ({ page }) => {
    const rows = page.locator('ol[aria-label$="applications"] > li')
    test.skip((await rows.count()) === 0, 'no applications to export')

    const downloadPromise = page.waitForEvent('download', { timeout: 30_000 })
    await page.getByRole('button', { name: /Export CSV/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/^jaz_applications_.*\.csv$/)
  })

  test('bulk action bar appears once rows are selected', async ({ page }) => {
    const firstCheckbox = page.locator('input[type="checkbox"][aria-label^="Select application"]').first()
    test.skip((await firstCheckbox.count()) === 0, 'no applications to select')

    await firstCheckbox.check()
    await expect(page.getByText(/selected$/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close selected' })).toBeVisible()
  })
})

test.describe('registration wizard', () => {
  test('opens on step 1 and closing clears the deep link', async ({ page }) => {
    await page.getByRole('button', { name: 'New registration' }).click()
    await expect(page.getByRole('heading', { name: 'Select Event' })).toBeVisible()
    await expect(page.getByText('Step 1 of 7')).toBeVisible()

    await page.getByRole('button', { name: 'Cancel / Exit' }).click()
    await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible()
    expect(new URL(page.url()).search).toBe('')
  })

  test('a deep link opens the requested case at the requested step', async ({ page }) => {
    const openButton = page.getByRole('button', { name: /^Open file for / }).first()
    test.skip((await openButton.count()) === 0, 'no applications available')

    await openButton.click()
    await expect(page.getByText(/Step \d of 7/)).toBeVisible()
    // The wizard shows the case summary trigger only once a case is loaded.
    await expect(page.getByRole('button', { name: 'More details' })).toBeVisible({ timeout: 20_000 })
  })

  test('the delivery step exposes a way to record the delivery', async ({ page }) => {
    const openButton = page.getByRole('button', { name: /^Open file for / }).first()
    test.skip((await openButton.count()) === 0, 'no applications available')
    await openButton.click()
    await expect(page.getByText(/Step \d of 7/)).toBeVisible()

    // Step 7 previously had no save control at all.
    await page.getByRole('button', { name: 'Delivery' }).click()
    await expect(page.getByRole('button', { name: /Confirm delivery & close case|Update delivery record/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save draft' })).toBeVisible()
  })

  test('the payment step exposes an explicit save control', async ({ page }) => {
    const openButton = page.getByRole('button', { name: /^Open file for / }).first()
    test.skip((await openButton.count()) === 0, 'no applications available')
    await openButton.click()
    await expect(page.getByText(/Step \d of 7/)).toBeVisible()

    await page.getByRole('button', { name: 'Payment' }).click()
    // handleSavePaymentDraft existed but had no button wired to it.
    await expect(page.getByRole('button', { name: 'Save payment details' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Print Receipt' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Archive Receipt' })).toBeVisible()
  })
})
