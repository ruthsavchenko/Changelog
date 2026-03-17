export type ChangelogActionType = 'moved' | 'duration_changed' | 'added' | 'deleted'

export interface ChangelogEntry {
  id: string
  actionType: ChangelogActionType
  processName: string   // e.g. "Foundation Work"
  description: string   // detail of what changed, shown when expanded
  actor: string         // user who made the change
  date: string
}

export interface ChangelogPage {
  entries: ChangelogEntry[]
  nextCursor: number | null
  total: number
}

export interface ChangelogFilters {
  type: ChangelogActionType | 'all'
  search: string
}
