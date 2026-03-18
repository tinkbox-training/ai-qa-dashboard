interface RunsFiltersProps {
  searchTerm: string;
  selectedStatus: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
}

export function RunsFilters({
  searchTerm,
  selectedStatus,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onReset,
}: RunsFiltersProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr auto',
        gap: '12px',
        alignItems: 'end',
      }}
    >
      <div>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#475569' }}>
          Search
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by run ID or requirement..."
          style={{
            width: '100%',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '10px 12px',
            font: 'inherit',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#475569' }}>
          Status
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          style={{
            width: '100%',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '10px 12px',
            font: 'inherit',
            background: '#fff',
          }}
        >
          <option value="all">All</option>
          <option value="queued">Queued</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#475569' }}>
          Sort
        </label>
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            width: '100%',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '10px 12px',
            font: 'inherit',
            background: '#fff',
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onReset}
        style={{
          background: '#fff',
          color: '#0f172a',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '10px 14px',
          cursor: 'pointer',
          fontWeight: 600,
          height: '42px',
        }}
      >
        Reset
      </button>
    </div>
  );
}