import React, { useMemo, useState } from "react";

export default function SimpleDataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyText = "No records found.",
  searchPlaceholder = "Search...",
  initialRowsPerPage = 10,
  rowsPerPageOptions = [10, 25, 50],
  rowKey = "id",
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [sortKey, setSortKey] = useState(columns.find((col) => col.sortable)?.key || "");
  const [sortDir, setSortDir] = useState("asc");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredRows = useMemo(() => {
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      columns.some((column) => {
        const raw = typeof column.searchValue === "function"
          ? column.searchValue(row)
          : column.key
          ? row[column.key]
          : "";
        if (raw === undefined || raw === null) return false;
        return String(raw).toLowerCase().includes(normalizedQuery);
      })
    );
  }, [rows, columns, normalizedQuery]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const column = columns.find((col) => col.key === sortKey);
    if (!column) return filteredRows;
    const sorted = [...filteredRows].sort((a, b) => {
      const aValue = typeof column.sortValue === "function"
        ? column.sortValue(a)
        : a[sortKey];
      const bValue = typeof column.sortValue === "function"
        ? column.sortValue(b)
        : b[sortKey];

      if (aValue === bValue) return 0;
      if (aValue === undefined || aValue === null || aValue === "") return 1;
      if (bValue === undefined || bValue === null || bValue === "") return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDir === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortDir === "asc"
        ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: "base" })
        : String(bValue).localeCompare(String(aValue), undefined, { numeric: true, sensitivity: "base" });
    });
    return sorted;
  }, [filteredRows, columns, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, currentPage, rowsPerPage]);

  const setSort = (key, sortable) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const showingFrom = sortedRows.length ? (currentPage - 1) * rowsPerPage + 1 : 0;
  const showingTo = Math.min(currentPage * rowsPerPage, sortedRows.length);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap p-3 border-bottom">
        <div className="form-group mb-2 mr-3" style={{ minWidth: 280 }}>
          <label className="small text-muted mb-1">Search</label>
          <input
            type="text"
            className="form-control"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="form-group mb-2" style={{ width: 130 }}>
          <label className="small text-muted mb-1">Rows</label>
          <select
            className="form-control"
            value={rowsPerPage}
            onChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(1);
            }}
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle mb-0">
          <thead className="thead-light">
            <tr>
              {columns.map((column) => {
                const isSorted = sortKey === column.key;
                return (
                  <th
                    key={column.key || column.header}
                    style={{ width: column.width, cursor: column.sortable ? "pointer" : "default", whiteSpace: "nowrap" }}
                    onClick={() => setSort(column.key, column.sortable)}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <span>{column.header}</span>
                      {column.sortable ? (
                        <small className="text-muted ml-2">{isSorted ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</small>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">Loading data…</td>
              </tr>
            ) : !pagedRows.length ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">{emptyText}</td>
              </tr>
            ) : pagedRows.map((row, index) => (
              <tr key={row[rowKey] ?? index}>
                {columns.map((column) => (
                  <td key={column.key || column.header} style={{ whiteSpace: column.nowrap ? "nowrap" : "normal" }}>
                    {typeof column.render === "function"
                      ? column.render(row, index + showingFrom)
                      : row[column.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap p-3 border-top">
        <div className="small text-muted mb-2 mb-md-0">
          Showing {showingFrom} to {showingTo} of {sortedRows.length} records
        </div>
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1} onClick={() => setPage(1)}>
            First
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
            Prev
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary" disabled>
            Page {currentPage} / {totalPages}
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
            Next
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)}>
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
