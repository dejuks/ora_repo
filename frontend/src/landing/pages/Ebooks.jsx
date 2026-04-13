// pages/EbookDashboard.jsx - With working PDF viewer
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import publicEbookApi from "../../api/public_ebook.api.js";
import "./ebook.css";

export default function EbookDashboard() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [allEbooks, setAllEbooks] = useState([]);
  const [filteredEbooks, setFilteredEbooks] = useState([]);
  const [stats, setStats] = useState({
    totalEbooks: 0,
    totalAuthors: 0,
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const publications = await publicEbookApi.listPublications({ limit: 50 });
        const ebookList = publications.rows || [];

        setAllEbooks(ebookList);
        setFilteredEbooks(ebookList);

        // Calculate stats
        const authors = new Set();
        ebookList.forEach(book => {
          if (book.authors && Array.isArray(book.authors)) {
            book.authors.forEach(author => authors.add(author));
          }
        });

        setStats({
          totalEbooks: ebookList.length,
          totalAuthors: authors.size,
        });

        // Create categories from journals
        const uniqueCategories = new Map();
        ebookList.forEach(book => {
          if (book.journal) {
            if (!uniqueCategories.has(book.journal)) {
              uniqueCategories.set(book.journal, {
                id: uniqueCategories.size + 1,
                name: book.journal,
                slug: book.journal.toLowerCase().replace(/\s+/g, '-'),
                count: 0
              });
            }
            uniqueCategories.get(book.journal).count++;
          }
        });
        
        const catArray = Array.from(uniqueCategories.values());
        setCategories(catArray);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter ebooks by category
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredEbooks(allEbooks);
    } else {
      const filtered = allEbooks.filter(book => book.journal === selectedCategory);
      setFilteredEbooks(filtered);
    }
  }, [selectedCategory, allEbooks]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchResults = allEbooks.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.authors?.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        book.journal?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEbooks(searchResults);
    } else {
      setFilteredEbooks(allEbooks);
    }
  };

  const handleDownload = async (uuid, fileUrl, title) => {
    try {
      if (fileUrl) {
        await publicEbookApi.downloadByFileUrl(fileUrl, title);
      } else {
        await publicEbookApi.downloadEbook(uuid, "pdf");
      }
      alert("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setPdfLoading(true);
    setPdfError(false);
    
    if (book.file_url) {
      const fullPdfUrl = publicEbookApi.getPdfViewerUrl(book.file_url);
      setPdfUrl(fullPdfUrl);
      
      // Test if PDF is accessible
      fetch(fullPdfUrl, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            setPdfError(true);
          }
          setPdfLoading(false);
        })
        .catch(() => {
          setPdfError(true);
          setPdfLoading(false);
        });
    } else {
      setPdfUrl(null);
      setPdfLoading(false);
      setPdfError(true);
    }
    
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBook(null);
    setPdfUrl(null);
    setPdfError(false);
    document.body.style.overflow = 'auto';
  };

  // Get featured ebooks
  const getFeaturedEbooks = () => {
    return allEbooks.slice(0, 6);
  };

  const featuredEbooks = getFeaturedEbooks();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading library...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="gutenberg-container">
        {/* Mobile Sidebar Toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="gutenberg-layout">
          {/* LEFT SIDEBAR */}
          <aside className={`gutenberg-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h2>📚 Library</h2>
              <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
            </div>
            
            <div className="search-box">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Go</button>
              </form>
            </div>

            <div className="categories-section">
              <h3>Categories</h3>
              <ul className="category-list">
                <li 
                  className={selectedCategory === 'all' ? 'active' : ''}
                  onClick={() => {
                    setSelectedCategory('all');
                    setSidebarOpen(false);
                  }}
                >
                  <span>📖 All Books</span>
                  <span className="count">{allEbooks.length}</span>
                </li>
                {categories.map((cat) => (
                  <li 
                    key={cat.id}
                    className={selectedCategory === cat.name ? 'active' : ''}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setSidebarOpen(false);
                    }}
                  >
                    <span>📘 {cat.name}</span>
                    <span className="count">{cat.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="library-stats">
              <div className="stat">
                <div className="stat-number">{stats.totalEbooks}</div>
                <div className="stat-label">Books</div>
              </div>
              <div className="stat">
                <div className="stat-number">{stats.totalAuthors}</div>
                <div className="stat-label">Authors</div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="gutenberg-main">
            {/* Hero Banner */}
            <div className="hero-banner">
              <div className="banner-content">
                <h1>Oromo eBooks</h1>
                <p>Free digital library • {stats.totalEbooks} books • Open access</p>
                <Link to="/ebook/author/register" className="contribute-btn">
                  Contribute a Book →
                </Link>
              </div>
            </div>

            {/* Featured Books */}
            <div className="featured-books">
              <h2>Featured Books</h2>
              <div className="featured-grid">
                {featuredEbooks.map((book) => (
                  <div key={book.uuid} className="featured-book-card">
                    <div className="book-cover-simple">
                      <span className="book-icon">📘</span>
                    </div>
                    <div className="book-info">
                      <h4>{book.title}</h4>
                      <p>{book.authors?.join(", ")}</p>
                      <button onClick={() => handleViewBook(book)} className="view-btn">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Books Grid */}
            <div className="all-books">
              <h2>
                {selectedCategory === 'all' ? 'All Books' : selectedCategory}
                <span className="book-count">({filteredEbooks.length} books)</span>
              </h2>
              
              {filteredEbooks.length === 0 ? (
                <div className="no-books">
                  <p>No books found in this category.</p>
                </div>
              ) : (
                <div className="books-list">
                  {filteredEbooks.map((book, index) => (
                    <div key={book.uuid} className="book-list-item">
                      <div className="book-number">{index + 1}.</div>
                      <div className="book-details">
                        <div className="book-title-section">
                          <h3 className="book-title">
                            <button 
                              onClick={() => handleViewBook(book)}
                              className="book-title-link"
                            >
                              {book.title}
                            </button>
                          </h3>
                          <div className="book-meta">
                            <span className="book-author">
                              {book.authors?.join(", ")}
                            </span>
                            {book.year && (
                              <span className="book-year">({book.year})</span>
                            )}
                          </div>
                          {book.journal && (
                            <div className="book-journal">{book.journal}</div>
                          )}
                          {book.abstract && (
                            <p className="book-description">
                              {book.abstract.substring(0, 150)}...
                            </p>
                          )}
                          <div className="book-actions">
                            <button 
                              onClick={() => handleViewBook(book)}
                              className="read-link"
                            >
                              Read online →
                            </button>
                            <button 
                              onClick={() => handleDownload(book.uuid, book.file_url, book.title)}
                              className="download-link"
                            >
                              Download PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="gutenberg-footer">
              <p>© {new Date().getFullYear()} Oromo eBooks • Free digital library</p>
              <p>Part of the open access movement • Preserving Oromo literature</p>
            </footer>
          </main>
        </div>
      </div>

      {/* BOOK VIEW MODAL WITH NATIVE PDF VIEWER */}
      {showModal && selectedBook && (
        <div className="book-modal-overlay" onClick={closeModal}>
          <div className="book-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBook.title}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="pdf-viewer-container">
                {pdfLoading ? (
                  <div className="pdf-loading">
                    <div className="spinner-small"></div>
                    <p>Loading PDF...</p>
                  </div>
                ) : pdfError ? (
                  <div className="pdf-error">
                    <span className="error-icon">📄</span>
                    <h3>Cannot Preview PDF</h3>
                    <p>The PDF file couldn't be loaded. Please download it to read.</p>
                    <button 
                      onClick={() => handleDownload(selectedBook.uuid, selectedBook.file_url, selectedBook.title)}
                      className="download-btn-large"
                    >
                      Download PDF
                    </button>
                  </div>
                ) : pdfUrl ? (
                  <object
                    data={pdfUrl}
                    type="application/pdf"
                    className="pdf-object"
                    onError={() => setPdfError(true)}
                  >
                    <embed
                      src={pdfUrl}
                      type="application/pdf"
                      className="pdf-embed"
                    />
                  </object>
                ) : (
                  <div className="no-preview">
                    <p>No PDF available for preview.</p>
                    <button 
                      onClick={() => handleDownload(selectedBook.uuid, selectedBook.file_url, selectedBook.title)}
                      className="download-btn-large"
                    >
                      Download PDF to read
                    </button>
                  </div>
                )}
              </div>
              
              <div className="book-info-sidebar">
                <div className="metadata-section">
                  <h3>Book Information</h3>
                  <div className="metadata-row">
                    <strong>Title:</strong> {selectedBook.title}
                  </div>
                  <div className="metadata-row">
                    <strong>Author(s):</strong> {selectedBook.authors?.join(", ")}
                  </div>
                  {selectedBook.journal && (
                    <div className="metadata-row">
                      <strong>Journal/Publisher:</strong> {selectedBook.journal}
                    </div>
                  )}
                  {selectedBook.year && (
                    <div className="metadata-row">
                      <strong>Year:</strong> {selectedBook.year}
                    </div>
                  )}
                  {selectedBook.doi && (
                    <div className="metadata-row">
                      <strong>DOI:</strong> {selectedBook.doi}
                    </div>
                  )}
                </div>

                {selectedBook.abstract && (
                  <div className="metadata-section">
                    <h3>Abstract</h3>
                    <p className="book-abstract-full">{selectedBook.abstract}</p>
                  </div>
                )}

                <div className="action-buttons">
                  <button 
                    onClick={() => handleDownload(selectedBook.uuid, selectedBook.file_url, selectedBook.title)}
                    className="download-btn-large"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                  {pdfUrl && !pdfError && (
                    <a 
                      href={pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="open-new-btn"
                    >
                      Open in New Tab
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}