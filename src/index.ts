import { SelectQueryBuilder } from 'typeorm';

/**
 * Apply dynamic search filters to a TypeORM query builder
 * @param qb - The TypeORM query builder instance
 * @param search - Array of search filters (key-value pairs)
 * @param searchableFields - A map of field keys to column names in the database
 */
export function applyDynamicSearchFilters(
  qb: SelectQueryBuilder<any>,       // QueryBuilder instance
  search: { key: string; value: string }[],  // Array of search filters
  searchableFields: Record<string, string>  // Map of field keys to column names
): void {
  if (search && search.length > 0) {
    // Array to store individual search conditions
    const searchQueryArray: string[] = search
      .map(({ key, value }) => {
        const column = searchableFields[key]; // Get column name from the map
        if (column) {
          return `${column} ILIKE :${key}`; // Create dynamic search condition using ILIKE
        }
        return ''; // Return empty if no column is found for the key
      })
      .filter(Boolean); // Remove empty strings from the query array

    if (searchQueryArray.length > 0) {
      const searchQuery = searchQueryArray.join(' AND '); // Combine all conditions with "AND"
      qb.where(searchQuery);

      // Bind parameters dynamically based on the search filters
      search.forEach(({ key, value }) => {
        qb.setParameter(key, `%${value}%`); // Use the key as the parameter name to prevent SQL injection
      });
    }
  }
}
