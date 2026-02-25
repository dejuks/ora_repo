import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getArticles, deleteArticle, restoreArticle, permanentlyDeleteArticle } from "../../api/wikiArticle.api";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaLock, FaUnlock, FaBan, FaHistory, FaUndo } from "react-icons/fa";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  
  // Admin state - you can get this from your auth context
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });
  const isAdmin = currentUser?.role === 'Wikipedia Administrator' || currentUser?.role === 'sysop';
console.log(currentUser);
  // Fetch articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles();
      const data = res.data;
      setArticles(data);
      setFiltered(data);
      
      // Extract unique categories
      const allCats = [];
      data.forEach(article => {
        article.categories?.forEach(cat => {
          if (!allCats.find(c => c.id === cat.id)) {
            allCats.push(cat);
          }
        });
      });
      setCategories(allCats);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load articles' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Filter articles
  useEffect(() => {
    let result = [...articles];
    
    if (search) {
      result = result.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.author_name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      result = result.filter(a => a.status === statusFilter);
    }
    
    if (categoryFilter !== "all") {
      result = result.filter(a => 
        a.categories?.some(cat => cat.id === categoryFilter)
      );
    }
    
    setFiltered(result);
  }, [search, statusFilter, categoryFilter, articles]);

  // Regular delete (soft delete)
  const remove = async (id, title) => {
    const result = await Swal.fire({
      title: 'Delete Article?',
      text: `Are you sure you want to delete "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Delete'
    });

    if (result.isConfirmed) {
      try {
        await deleteArticle(id);
        Swal.fire('Deleted!', 'Article has been deleted.', 'success');
        fetchArticles();
      } catch {
        Swal.fire('Error', 'Failed to delete article', 'error');
      }
    }
  };

  // Admin: Restore article
  const restore = async (id, title) => {
    const result = await Swal.fire({
      title: 'Restore Article?',
      text: `Restore "${title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Restore'
    });

    if (result.isConfirmed) {
      try {
        await restoreArticle(id);
        Swal.fire('Restored!', 'Article has been restored.', 'success');
        fetchArticles();
      } catch {
        Swal.fire('Error', 'Failed to restore article', 'error');
      }
    }
  };

  // Admin: Permanent delete
  const permanentDelete = async (id, title) => {
    const result = await Swal.fire({
      title: 'Permanently Delete Article?',
      html: `
        <p>Are you sure you want to permanently delete "<strong>${title}</strong>"?</p>
        <p class="text-danger"><strong>This action cannot be undone!</strong></p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Delete Permanently',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await permanentlyDeleteArticle(id);
        Swal.fire('Deleted!', 'Article has been permanently deleted.', 'success');
        fetchArticles();
      } catch {
        Swal.fire('Error', 'Failed to delete article', 'error');
      }
    }
  };

  // Admin: Block user (you'll need to implement this API)
  const blockUser = async (userId, username) => {
    const { value: reason } = await Swal.fire({
      title: `Block User: ${username}`,
      input: 'textarea',
      inputLabel: 'Block Reason',
      inputPlaceholder: 'Enter reason for blocking...',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Block User'
    });

    if (reason) {
      try {
        // Call your block user API here
        // await blockUser(userId, reason);
        Swal.fire('Blocked!', `User ${username} has been blocked.`, 'success');
      } catch {
        Swal.fire('Error', 'Failed to block user', 'error');
      }
    }
  };

  // Admin: Protect article (you'll need to implement this API)
  const protectArticle = async (id, title) => {
    const { value: protectionLevel } = await Swal.fire({
      title: `Protect Article: ${title}`,
      input: 'select',
      inputOptions: {
        'semi': 'Semi-protection (autoconfirmed users only)',
        'full': 'Full protection (admins only)'
      },
      inputPlaceholder: 'Select protection level',
      showCancelButton: true,
      confirmButtonText: 'Protect'
    });

    if (protectionLevel) {
      try {
        // Call your protect article API here
        // await protectArticle(id, protectionLevel);
        Swal.fire('Protected!', `Article is now ${protectionLevel === 'semi' ? 'semi-protected' : 'fully protected'}.`, 'success');
      } catch {
        Swal.fire('Error', 'Failed to protect article', 'error');
      }
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const colors = {
      published: 'bg-success',
      draft: 'bg-warning',
      under_review: 'bg-info',
      archived: 'bg-secondary'
    };
    return <span className={`badge ${colors[status] || 'bg-secondary'} text-white`}>{status}</span>;
  };

  // Protection badge (if your articles have protection level)
  const getProtectionBadge = (article) => {
    if (article.protection_level === 'full') {
      return <span className="badge bg-danger text-white ms-1"><FaLock /> Full</span>;
    } else if (article.protection_level === 'semi') {
      return <span className="badge bg-warning text-white ms-1"><FaLock /> Semi</span>;
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        {/* Header with admin indicator */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>Wiki Articles</h2>
            {isAdmin && (
              <span className="badge bg-danger mt-1">
                <FaLock className="me-1" /> Admin Mode
              </span>
            )}
          </div>
          <Link to="/wiki/articles/create" className="btn btn-primary">
            <FaPlus className="me-2" /> New Article
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    className="form-control"
                    placeholder="Search by title or author..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="under_review">Under Review</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h6>Total</h6>
                <h3>{articles.length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h6>Published</h6>
                <h3>{articles.filter(a => a.status === 'published').length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h6>Draft</h6>
                <h3>{articles.filter(a => a.status === 'draft').length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h6>Total Views</h6>
                <h3>{articles.reduce((sum, a) => sum + (a.view_count || 0), 0)}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Actions */}
        {isAdmin && (
          <div className="card mb-4 border-danger">
            <div className="card-header bg-danger text-white">
              <FaLock className="me-2" /> Admin Tools
            </div>
            <div className="card-body">
              <p className="mb-2">Quick moderation actions:</p>
              <button className="btn btn-outline-danger me-2" onClick={() => setStatusFilter('archived')}>
                <FaHistory className="me-2" /> View Archived
              </button>
              <button className="btn btn-outline-warning" onClick={() => setStatusFilter('under_review')}>
                <FaEye className="me-2" /> Under Review
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No articles found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Protection</th>
                      <th>Views</th>
                      <th>Created</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(article => (
                      <tr key={article.id} className={article.status === 'archived' ? 'table-secondary' : ''}>
                        <td>
                          <div>
                            <strong>{article.title}</strong>
                            {article.is_featured && (
                              <span className="badge bg-warning ms-2">Featured</span>
                            )}
                            {getProtectionBadge(article)}
                            <div className="small text-muted">{article.slug}</div>
                          </div>
                        </td>
                        <td>
                          {article.author_name || 'Unknown'}
                          {isAdmin && article.created_by && (
                            <button 
                              className="btn btn-link btn-sm text-danger p-0 ms-2"
                              onClick={() => blockUser(article.created_by, article.author_name)}
                              title="Block user"
                            >
                              <FaBan />
                            </button>
                          )}
                        </td>
                        
                        <td>{getStatusBadge(article.status)}</td>
                        <td>
                          {article.protection_level ? (
                            <span className="badge bg-danger">
                              <FaLock /> {article.protection_level}
                            </span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                          {isAdmin && article.status === 'published' && (
                            <button 
                              className="btn btn-link btn-sm text-warning p-0 ms-2"
                              onClick={() => protectArticle(article.id, article.title)}
                              title="Protect article"
                            >
                              <FaLock />
                            </button>
                          )}
                        </td>
                        <td>{article.view_count || 0}</td>
                        <td>{new Date(article.created_at).toLocaleDateString()}</td>
                        <td className="text-end">
                          {/* View button - always visible */}
                          <Link
                            to={`/wiki/articles/${article.slug || article.id}`}
                            className="btn btn-sm btn-outline-info me-1"
                            title="View"
                          >
                            <FaEye />
                          </Link>

                          {/* Edit button - visible to all */}
                          <Link
                            to={`/wiki/articles/edit/${article.id}`}
                            className="btn btn-sm btn-outline-warning me-1"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>

                          {/* Delete/Restore buttons - admin only for certain actions */}
                          {article.status === 'archived' ? (
                            isAdmin && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success me-1"
                                  onClick={() => restore(article.id, article.title)}
                                  title="Restore"
                                >
                                  <FaUndo />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => permanentDelete(article.id, article.title)}
                                  title="Delete Permanently"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => remove(article.id, article.title)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}