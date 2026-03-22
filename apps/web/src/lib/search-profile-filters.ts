export type SearchProfileFilterItem = {
  label: string;
  values: string[];
};

function stringifyValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [String(value)];
}

export function formatSearchProfileFilters(filters: Record<string, unknown>): SearchProfileFilterItem[] {
  return Object.entries(filters)
    .map(([key, value]) => ({
      label: key,
      values: stringifyValue(value)
    }))
    .filter((item) => item.values.length > 0);
}

