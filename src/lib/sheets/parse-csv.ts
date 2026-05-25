function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values.map((v) => v.trim());
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (header) {
        record[header] = values[index] ?? '';
      }
    });
    return record;
  });
}
