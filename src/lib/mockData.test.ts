import { describe, it, expect } from 'vitest'
import { fetchChangelogPage } from './mockData'

describe('fetchChangelogPage', () => {
  // --- pagination ---

  it('returns PAGE_SIZE entries for the first page', async () => {
    const result = await fetchChangelogPage(0, { type: 'all', search: '' })
    expect(result.entries).toHaveLength(20)
  })

  it('returns nextCursor pointing to the start of the next page', async () => {
    const result = await fetchChangelogPage(0, { type: 'all', search: '' })
    expect(result.nextCursor).toBe(20)
  })

  it('returns null nextCursor when there are no more entries', async () => {
    // 800 entries total, cursor 780 → last 20, no more
    const result = await fetchChangelogPage(780, { type: 'all', search: '' })
    expect(result.nextCursor).toBeNull()
  })

  it('returns correct total count for unfiltered data', async () => {
    const result = await fetchChangelogPage(0, { type: 'all', search: '' })
    expect(result.total).toBe(800)
  })

  // --- type filter ---

  it('returns only entries matching the requested action type', async () => {
    const result = await fetchChangelogPage(0, { type: 'moved', search: '' })
    result.entries.forEach((entry) => {
      expect(entry.actionType).toBe('moved')
    })
  })

  it('updates total to reflect filtered count', async () => {
    const all = await fetchChangelogPage(0, { type: 'all', search: '' })
    const moved = await fetchChangelogPage(0, { type: 'moved', search: '' })
    expect(moved.total).toBeLessThan(all.total)
  })

  // --- search filter ---

  it('returns only entries whose processName matches the search term', async () => {
    const result = await fetchChangelogPage(0, { type: 'all', search: 'Foundation' })
    result.entries.forEach((entry) => {
      const text = `${entry.processName} ${entry.description} ${entry.actor}`.toLowerCase()
      expect(text).toContain('foundation')
    })
  })

  it('returns empty entries when search matches nothing', async () => {
    const result = await fetchChangelogPage(0, { type: 'all', search: 'xyznotexist' })
    expect(result.entries).toHaveLength(0)
    expect(result.total).toBe(0)
    expect(result.nextCursor).toBeNull()
  })

  // --- type + search combined ---

  it('applies both type and search filters together', async () => {
    const result = await fetchChangelogPage(0, { type: 'moved', search: 'Foundation' })
    result.entries.forEach((entry) => {
      expect(entry.actionType).toBe('moved')
      const text = `${entry.processName} ${entry.description} ${entry.actor}`.toLowerCase()
      expect(text).toContain('foundation')
    })
  })
})
