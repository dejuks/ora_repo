import React, { useEffect, useState, useCallback } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Swal from "sweetalert2";
import { searchRepositoryItems } from "../../api/repository.api";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function RepositorySearch() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filterLetter, setFilterLetter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1); // Reset to first page when query changes
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchRepositoryItems({ 
        query: debouncedQuery, 
        filterLetter, 
        page 
      });
      
      // Check if response has the expected structure
      if (res.data && Array.isArray(res.data.items)) {
        setItems(res.data.items);
        setTotalPages(res.data.totalPages || 1);
      } else {
        // Handle unexpected response structure
        console.warn("Unexpected response structure:", res.data);
        setItems([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      let errorMessage = "Failed to fetch repository items";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || 
                      `Server error: ${error.response.status}`;
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      }
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });
      
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filterLetter, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleLetterClick = (letter) => {
    const newLetter = letter === filterLetter ? "" : letter;
    setFilterLetter(newLetter);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClearFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setFilterLetter("");
    setPage(1);
  };

  const hasFilters = query || filterLetter;

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-2xl">Repository Search</h3>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Search input */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or abstract..."
                value={query}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {debouncedQuery && query !== debouncedQuery ? "Searching..." : "Type to search repository items"}
            </p>
          </div>

          {/* Alphabet filter */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">Filter by First Letter</h4>
            <div className="flex flex-wrap gap-2">
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  className={`px-4 py-2 rounded-lg border transition-all font-medium min-w-[44px] ${
                    filterLetter === letter
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  }`}
                  onClick={() => handleLetterClick(letter)}
                >
                  {letter}
                </button>
              ))}
              <button
                className={`px-4 py-2 rounded-lg border transition-all font-medium ${
                  filterLetter === ""
                    ? "bg-gray-600 text-white border-gray-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => handleLetterClick("")}
              >
                All
              </button>
            </div>
          </div>

          {/* Results summary */}
          <div className="mb-4 flex justify-between items-center">
            <div>
              {loading ? (
                <span className="text-gray-600">Searching...</span>
              ) : items.length > 0 ? (
                <span className="text-gray-600">
                  Showing {items.length} item{items.length !== 1 ? 's' : ''} 
                  {totalPages > 1 && ` • Page ${page} of ${totalPages}`}
                </span>
              ) : !loading && (
                <span className="text-gray-600">No items found</span>
              )}
            </div>
            {items.length > 0 && (
              <div className="text-sm text-gray-500">
                Total Pages: {totalPages}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading repository items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4 text-4xl">📄</div>
                <p className="text-gray-600 mb-2">No repository items found</p>
                <p className="text-gray-500 text-sm">
                  {hasFilters 
                    ? "Try adjusting your search or filters" 
                    : "No items available in the repository yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Access
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr 
                        key={item.uuid} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          // Optional: Add navigation to item detail
                          console.log('Item clicked:', item.uuid);
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.title || 'Untitled'}</div>
                          {item.abstract && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.abstract}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {item.item_type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.language || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.access_level === 'open' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.access_level || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                            item.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : item.status === "submitted"
                              ? "bg-yellow-100 text-yellow-800"
                              : item.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg border font-medium ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg border font-medium min-w-[44px] ${
                          page === pageNum
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg border font-medium ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {items.length > 0 ? `${items.length} items per page` : ''}
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}