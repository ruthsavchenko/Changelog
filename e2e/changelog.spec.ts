import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/changelog')
  // Wait for the first entry to appear — confirms data loaded
  await page.waitForSelector('[role="option"]')
})

// --- initial load ---

test('shows the changelog heading', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Changelog' })).toBeVisible()
})

test('shows entries after loading', async ({ page }) => {
  const entries = page.locator('[role="option"]')
  await expect(entries.first()).toBeVisible()
})

test('shows total entry count', async ({ page }) => {
  await expect(page.getByText(/\d+ entries/)).toBeVisible()
})

// // --- filter tabs ---

test('filters the list when a type tab is clicked', async ({ page }) => {
  await page.getByRole('button', { name: 'Moved' }).click()

  // URL should update to reflect the filter
  await expect(page).toHaveURL(/type=moved/)

  // Every visible badge should say "MOVED"
  const badges = page.locator('[role="option"] .uppercase')
  const count = await badges.count()
  for (let i = 0; i < count; i++) {
    await expect(badges.nth(i)).toHaveText('Moved')
  }
})

test('clears the filter when All is clicked', async ({ page }) => {
  await page.getByRole('button', { name: 'Moved' }).click()
  await page.getByRole('button', { name: 'All' }).click()
  await expect(page).not.toHaveURL(/type=/)
})

// --- search ---

test('filters entries by search term', async ({ page }) => {
  await page.getByPlaceholder('Search by process, actor...').fill('Foundation')
  // Wait for debounce + refetch
  await page.waitForTimeout(400)
  await page.waitForSelector('[role="option"]')

  const entries = page.locator('[role="option"]')
  const count = await entries.count()
  for (let i = 0; i < count; i++) {
    await expect(entries.nth(i)).toContainText('Foundation')
  }
})

test('shows empty state when search matches nothing', async ({ page }) => {
  await page.getByPlaceholder('Search by process, actor...').fill('xyznotexist')
  await page.waitForTimeout(400)
  await expect(page.getByText('No entries found.')).toBeVisible()
})

// --- keyboard navigation (the star feature) ---

test('moves focus to the next item on ArrowDown', async ({ page }) => {
  // Click somewhere on the page to ensure window has focus
  await page.locator('body').click()

  const items = page.locator('[role="option"]')
  await expect(items.nth(0)).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowDown')
  await expect(items.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(items.nth(0)).toHaveAttribute('aria-selected', 'false')
})

test('expands an entry when Enter is pressed', async ({ page }) => {
  await page.locator('body').click()

  // Focus first item (default) and press Enter
  await page.keyboard.press('Enter')

  // The expanded description should now be visible
  const firstItem = page.locator('[role="option"]').first()
  await expect(firstItem.locator('p')).toBeVisible()
})

test('clears focus when Escape is pressed', async ({ page }) => {
  await page.locator('body').click()

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Escape')

  // No item should be selected after Escape
  const items = page.locator('[role="option"]')
  const count = await items.count()
  for (let i = 0; i < count; i++) {
    await expect(items.nth(i)).toHaveAttribute('aria-selected', 'false')
  }
})

test('does not navigate with arrow keys while search is focused', async ({ page }) => {
  await page.getByPlaceholder('Search by process, actor...').focus()
  await page.keyboard.press('ArrowDown')

  // Second item should NOT be focused
  await expect(page.locator('[role="option"]').nth(1))
    .toHaveAttribute('aria-selected', 'false')
})

// --- infinite scroll ---

test('loads more entries when scrolled to the bottom', async ({ page }) => {
  await page.locator('[role="listbox"]').evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })

  await expect(page.getByText('Loading more...')).toBeVisible({ timeout: 2000 })
  await expect(page.getByText('Loading more...')).not.toBeVisible({ timeout: 5000 })
})
