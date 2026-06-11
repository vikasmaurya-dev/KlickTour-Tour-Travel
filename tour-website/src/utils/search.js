export const normalizeSearch = (value) => String(value ?? '').toLowerCase().trim();

export const matchesSearchFields = (item, term, fields = []) => {
  const searchText = normalizeSearch(term);
  if (!searchText) return true;

  return fields
    .map((field) => {
      const value = typeof field === 'function' ? field(item) : item?.[field];
      return value;
    })
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(searchText));
};

