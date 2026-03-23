export default function SearchBar({
  value,
  onChange,
  results,
  onSelect,
  loading,
  breadcrumb
}) {
  return (
    <div className="search-wrap glass-card fade-in-up">
      <div className="search-head">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search any city..."
          aria-label="Search city"
        />
        {loading && <span className="mono">searching...</span>}
      </div>
      <p className="mono breadcrumb">📍 {breadcrumb || 'Location unknown'}</p>
      {!!results.length && (
        <ul className="search-results">
          {results.map((item) => (
            <li key={item.place_id}>
              <button type="button" onClick={() => onSelect(item)}>
                {item.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
