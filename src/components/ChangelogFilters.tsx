import type { ChangelogFilters } from '../types/changelog'
import { cn } from '../lib/utils'

const TYPE_OPTIONS: { value: ChangelogFilters['type']; label: string; color: string }[] = [
  { value: 'all',              label: 'All',      color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { value: 'moved',            label: 'Moved',    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'duration_changed', label: 'Duration', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  { value: 'added',            label: 'Added',    color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { value: 'deleted',          label: 'Deleted',  color: 'bg-red-100 text-red-700 hover:bg-red-200' },
]

interface ChangelogFiltersProps {
  type: ChangelogFilters['type']
  inputValue: string
  setType: (type: ChangelogFilters['type']) => void
  setSearch: (value: string) => void
  onSearchFocus: () => void
  onSearchBlur: () => void
}

export function ChangelogFilters({
  type,
  inputValue,
  setType,
  setSearch,
  onSearchFocus,
  onSearchBlur,
}: ChangelogFiltersProps) {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex gap-2 flex-wrap">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setType(option.value)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-all',
              option.color,
              type === option.value && 'ring-2 ring-offset-1 ring-current',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Search by process, actor..."
        value={inputValue}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={onSearchFocus}
        onBlur={onSearchBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
