import { create } from 'zustand'

interface ChangelogStore {
  expandedId: string | null
  toggleExpanded: (id: string) => void
}

export const useChangelogStore = create<ChangelogStore>()((set) => ({
  expandedId: null,
  toggleExpanded: (id) =>
    set((state) => ({ expandedId: state.expandedId === id ? null : id })),
}))
