import { describe, it, expect, beforeEach } from 'vitest'
import { useChangelogStore } from './useChangelogStore'

// Reset store state before every test so tests don't bleed into each other
beforeEach(() => {
  useChangelogStore.setState({ expandedId: null })
})

describe('useChangelogStore', () => {
  it('starts with no item expanded', () => {
    expect(useChangelogStore.getState().expandedId).toBeNull()
  })

  it('expands an item when toggleExpanded is called', () => {
    useChangelogStore.getState().toggleExpanded('entry-1')
    expect(useChangelogStore.getState().expandedId).toBe('entry-1')
  })

  it('collapses the item when the same id is toggled again', () => {
    useChangelogStore.getState().toggleExpanded('entry-1')
    useChangelogStore.getState().toggleExpanded('entry-1')
    expect(useChangelogStore.getState().expandedId).toBeNull()
  })

  it('switches to a different item when a new id is toggled', () => {
    useChangelogStore.getState().toggleExpanded('entry-1')
    useChangelogStore.getState().toggleExpanded('entry-2')
    // entry-2 is now open, entry-1 is closed — only one can be open at a time
    expect(useChangelogStore.getState().expandedId).toBe('entry-2')
  })
})
