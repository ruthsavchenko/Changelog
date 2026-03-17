import type { ChangelogActionType, ChangelogEntry } from '../types/changelog'
import { useChangelogStore } from '../stores/useChangelogStore'
import { cn } from '../lib/utils'

const ACTION_STYLES: Record<ChangelogActionType, { className: string; label: string }> = {
  moved:            { className: 'bg-blue-100 text-blue-700',   label: 'Moved' },
  duration_changed: { className: 'bg-yellow-100 text-yellow-700', label: 'Duration' },
  added:            { className: 'bg-green-100 text-green-700', label: 'Added' },
  deleted:          { className: 'bg-red-100 text-red-700',     label: 'Deleted' },
}

interface ChangelogItemProps {
  entry: ChangelogEntry
  isFocused: boolean
}

export function ChangelogItem({ entry, isFocused }: ChangelogItemProps) {
  const { expandedId, toggleExpanded } = useChangelogStore()
  const expanded = expandedId === entry.id
  const { className, label } = ACTION_STYLES[entry.actionType]

  const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      role="option"
      aria-selected={isFocused}
      onClick={() => toggleExpanded(entry.id)}
      className={cn(
        'p-4 border-b border-gray-100 cursor-pointer transition-colors select-none',
        'hover:bg-gray-50',
        isFocused && 'bg-blue-50 ring-2 ring-inset ring-blue-400',
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn('px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide shrink-0', className)}>
          {label}
        </span>
        <span className="font-medium text-gray-900 flex-1 min-w-0">{entry.processName}</span>
        <div className="flex items-center gap-2 shrink-0 ml-auto text-xs text-gray-400">
          <span>{entry.actor}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          <span className="text-gray-300">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{entry.description}</p>
      )}

      {isFocused && !expanded && (
        <p className="mt-1 text-xs text-blue-500">Enter to expand · Esc to clear focus</p>
      )}
    </div>
  )
}
