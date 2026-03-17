import type { ChangelogActionType, ChangelogEntry, ChangelogFilters, ChangelogPage } from '../types/changelog'

const PAGE_SIZE = 20

const PROCESSES = [
  'Site Preparation',
  'Foundation Work',
  'Concrete Pouring',
  'Steel Framing',
  'Roof Structure',
  'Exterior Walls',
  'Electrical Rough-In',
  'Plumbing Rough-In',
  'HVAC Installation',
  'Insulation',
  'Drywall',
  'Interior Finishing',
  'Flooring',
  'Painting',
  'Final Inspections',
]

const ACTORS = [
  'Anna Kovalenko',
  'Dmytro Shevchenko',
  'Olena Melnyk',
  'Ivan Bondarenko',
  'Maria Tkachenko',
]

const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8']

function formatOffset(offset: number): string {
  const d = new Date(2024, 2, 1 + (offset % 28))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function generateDescription(actionType: ChangelogActionType, processName: string, i: number): string {
  switch (actionType) {
    case 'moved': {
      const from = WEEKS[i % 6]
      const to = WEEKS[(i % 6) + 2]
      return `Process rescheduled from ${from} to ${to}. Start date updated from ${formatOffset(i)} to ${formatOffset(i + 14)}. All downstream dependencies shifted accordingly. Project manager notified via email.`
    }
    case 'duration_changed': {
      const oldDays = (i % 5) + 3
      const newDays = oldDays + (i % 2 === 0 ? 2 : -1)
      return `Duration of "${processName}" updated from ${oldDays} to ${newDays} days. Change was triggered by updated supplier delivery schedule. Critical path recalculated — total project end date shifted by ${Math.abs(newDays - oldDays)} day(s).`
    }
    case 'added': {
      const week = WEEKS[i % 8]
      return `New process "${processName}" added to the board at ${week}. Estimated duration: ${(i % 7) + 2} days. Dependencies assigned to previous stage. Resource allocation pending approval.`
    }
    case 'deleted': {
      return `Process "${processName}" was removed from the board. Originally scheduled for ${WEEKS[i % 6]} with a duration of ${(i % 5) + 2} days. All dependent processes have been unlinked. This action cannot be undone.`
    }
  }
}

const ACTION_CYCLE: ChangelogActionType[] = ['moved', 'moved', 'duration_changed', 'added', 'deleted']

const ALL_ENTRIES: ChangelogEntry[] = Array.from({ length: 800 }, (_, i) => {
  const actionType = ACTION_CYCLE[i % ACTION_CYCLE.length]
  const processName = PROCESSES[i % PROCESSES.length]
  const actor = ACTORS[i % ACTORS.length]

  return {
    id: `entry-${i}`,
    actionType,
    processName,
    description: generateDescription(actionType, processName, i),
    actor,
    date: new Date(2024, 2, 1 + i).toISOString(),
  }
})

export async function fetchChangelogPage(
  cursor: number,
  filters: ChangelogFilters,
): Promise<ChangelogPage> {
  await new Promise((r) => setTimeout(r, 400))

  const filtered = ALL_ENTRIES.filter((entry) => {
    const matchesType = filters.type === 'all' || entry.actionType === filters.type
    const matchesSearch =
      !filters.search ||
      entry.processName.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.actor.toLowerCase().includes(filters.search.toLowerCase())
    return matchesType && matchesSearch
  })

  const page = filtered.slice(cursor, cursor + PAGE_SIZE)

  return {
    entries: page,
    nextCursor: cursor + PAGE_SIZE < filtered.length ? cursor + PAGE_SIZE : null,
    total: filtered.length,
  }
}
