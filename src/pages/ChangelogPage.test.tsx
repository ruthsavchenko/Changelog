import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ChangelogPage } from './ChangelogPage'
import type { ChangelogEntry } from '../types/changelog'

// Mock the API so tests don't depend on real data or network timing
vi.mock('../lib/mockData', () => ({
  fetchChangelogPage: vi.fn(),
}))

// useVirtualizer needs real browser layout (getBoundingClientRect) which jsdom
// doesn't provide. We replace it with a simple implementation that renders all
// items — good enough for integration tests, real virtualisation is covered by E2E.
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: () => number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        index: i,
        start: i * estimateSize(),
      })),
    getTotalSize: () => count * estimateSize(),
    measureElement: () => {},
    scrollToIndex: () => {},
  }),
}))

import { fetchChangelogPage } from '../lib/mockData'
const mockFetch = vi.mocked(fetchChangelogPage)

// A small set of fake entries — enough to test behaviour without noise
const MOCK_ENTRIES: ChangelogEntry[] = [
  { id: 'e1', actionType: 'moved',            processName: 'Foundation Work',       description: 'Moved to week 3', actor: 'Anna K.',  date: '2024-03-01' },
  { id: 'e2', actionType: 'duration_changed', processName: 'Steel Framing',         description: 'Duration extended', actor: 'Ivan B.', date: '2024-03-02' },
  { id: 'e3', actionType: 'added',            processName: 'Electrical Rough-In',   description: 'New process added', actor: 'Olena M.', date: '2024-03-03' },
  { id: 'e4', actionType: 'deleted',          processName: 'Concrete Pouring',      description: 'Process removed',  actor: 'Anna K.',  date: '2024-03-04' },
]

// Helper: fresh QueryClient per test — avoids cache bleeding between tests
function renderPage(initialUrl = '/changelog') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <QueryClientProvider client={client}>
        <ChangelogPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetch.mockResolvedValue({
    entries: MOCK_ENTRIES,
    nextCursor: null,
    total: MOCK_ENTRIES.length,
  })
})

describe('ChangelogPage', () => {
  // --- initial render ---

  it('shows a loading skeleton before data arrives', () => {
    // Never resolves → stays in loading state
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderPage()
    // skeleton is rendered as animated placeholder divs
    const skeletonItems = document.querySelectorAll('.animate-pulse')
    expect(skeletonItems.length).toBeGreaterThan(0)
  })

  it('renders entries after data loads', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Foundation Work')).toBeInTheDocument()
    })
    expect(screen.getByText('Steel Framing')).toBeInTheDocument()
  })

  it('shows the total entry count', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('4 entries')).toBeInTheDocument()
    })
  })

  it('shows an empty state when no entries match', async () => {
    mockFetch.mockResolvedValue({ entries: [], nextCursor: null, total: 0 })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('No entries found.')).toBeInTheDocument()
    })
  })

  // --- filter interaction ---

  it('calls the API with the correct type when a filter tab is clicked', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => screen.getByText('Foundation Work'))

    await user.click(screen.getByRole('button', { name: 'Moved' }))

    await waitFor(() => {
      // Second call should include type: 'moved'
      const lastCall = mockFetch.mock.calls.at(-1)!
      expect(lastCall[1].type).toBe('moved')
    })
  })

  it('resets to the first page (cursor 0) when the filter changes', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => screen.getByText('Foundation Work'))

    await user.click(screen.getByRole('button', { name: 'Added' }))

    await waitFor(() => {
      const lastCall = mockFetch.mock.calls.at(-1)!
      expect(lastCall[0]).toBe(0) // cursor must be 0
    })
  })

  // --- keyboard navigation ---

  it('moves focus down when ArrowDown is pressed', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => screen.getByText('Foundation Work'))

    // First item is focused by default (focusedIndex = 0)
    // After one ArrowDown the second item should be focused
    await user.keyboard('{ArrowDown}')

    const items = screen.getAllByRole('option')
    expect(items[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('expands the focused item when Enter is pressed', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => screen.getByText('Foundation Work'))

    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('Moved to week 3')).toBeInTheDocument()
    })
  })

  it('does not navigate with arrow keys while search input is focused', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => screen.getByText('Foundation Work'))

    const searchInput = screen.getByPlaceholderText('Search by process, actor...')
    await user.click(searchInput) // focuses the input

    await user.keyboard('{ArrowDown}') // should NOT move focusedIndex

    // All items should still have aria-selected false except the first (default)
    const items = screen.getAllByRole('option')
    expect(items[1]).toHaveAttribute('aria-selected', 'false')
  })
})
