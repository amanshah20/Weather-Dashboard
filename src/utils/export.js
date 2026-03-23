export function exportHistoricalCsv(fileName, rows) {
  if (!rows?.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((key) => {
          const value = row[key] ?? '';
          const escaped = String(value).replaceAll('"', '""');
          return `"${escaped}"`;
        })
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
