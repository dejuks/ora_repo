import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getArticles, deleteArticle, restoreArticle, permanentlyDeleteArticle } from "../../api/wikiArticle.api";
import { getUserRoles } from "../../api/user.api";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaLock, 
  FaBan, 
  FaHistory, 
  FaUndo,
  FaUser,
  FaCalendar,
  FaTag,
  FaGlobe,
  FaShieldAlt,
  FaUserCog,
  FaUserTie
} from "react-icons/fa";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  
  // User state
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });
  
  const [userRoles, setUserRoles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPermissions, setUserPermissions] = useState({
    canEdit: false,
    canDelete: false,
    canRestore: false,
    canPermanentDelete: false,
    canViewIp: false,
    canManageUsers: false
  });

  // Admin role names from database
  const ADMIN_ROLES = ['Wikipedia Administrator', 'sysop', 'admin', 'administrator'];

  // Fetch user roles from database
  const fetchUserRoles = async () => {
    if (!currentUser?.uuid) {
      setRolesLoading(false);
      return;
    }

    try {
      const response = await getUserRoles(currentUser.uuid);
      const roles = response.data || [];
      setUserRoles(roles);
      
      // Check if user has any admin role
      const hasAdminRole = roles.some(role => 
        ADMIN_ROLES.includes(role.name) || 
        role.name.toLowerCase().includes('admin') ||
        role.name.toLowerCase().includes('sysop')
      );
      
      setIsAdmin(hasAdminRole);
      
      // Set detailed permissions based on roles
      setUserPermissions({
        canEdit: hasAdminRole || roles.some(r => r.name === 'editor' || r.name === 'contributor'),
        canDelete: hasAdminRole || roles.some(r => r.name === 'editor'),
        canRestore: hasAdminRole,
        canPermanentDelete: hasAdminRole,
        canViewIp: hasAdminRole,
        canManageUsers: hasAdminRole
      });
      
      console.log("User Roles from DB:", roles);
      console.log("Is Admin:", hasAdminRole);
      console.log("Permissions:", {
        canEdit: hasAdminRole || roles.some(r => r.name === 'editor' || r.name === 'contributor'),
        canDelete: hasAdminRole || roles.some(r => r.name === 'editor'),
        canRestore: hasAdminRole,
        canPermanentDelete: hasAdminRole,
        canViewIp: hasAdminRole
      });
      
    } catch (error) {
      console.error("Error fetching user roles:", error);
      // Fallback to localStorage role if API fails
      const storedRole = currentUser?.role;
      const hasAdminRole = ADMIN_ROLES.includes(storedRole);
      setIsAdmin(hasAdminRole);
      setUserPermissions({
        canEdit: hasAdminRole || storedRole === 'editor',
        canDelete: hasAdminRole || storedRole === 'editor',
        canRestore: hasAdminRole,
        canPermanentDelete: hasAdminRole,
        canViewIp: hasAdminRole,
        canManageUsers: hasAdminRole
      });
    } finally {
      setRolesLoading(false);
    }
  };

  // Fetch articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles();
      // Handle different response structures
      const data = res.data.data || res.data;
      setArticles(data);
      setFiltered(data);
      
      // Extract unique categories
      const allCats = [];
      data.forEach(article => {
        if (article.categories && Array.isArray(article.categories)) {
          article.categories.forEach(cat => {
            if (cat && !allCats.find(c => c.id === cat.id)) {
              allCats.push(cat);
            }
          });
        }
      });
      setCategories(allCats);
    } catch (err) {
      console.error("Error fetching articles:", err);
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Failed to load articles' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user roles on component mount
  useEffect(() => {
    fetchUserRoles();
  }, [currentUser]);

  useEffect(() => {
    fetchArticles();
  }, []);

  // Filter articles based on search and filters
  useEffect(() => {
    let result = [...articles];
    
    if (search) {
      result = result.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.author_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.content?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      result = result.filter(a => a.status === statusFilter);
    }
    
    // Non-admins can't see archived articles
    if (!isAdmin) {
      result = result.filter(a => a.status !== 'archived');
    }
    
    if (categoryFilter !== "all" && categoryFilter) {
      result = result.filter(a => 
        a.categories?.some(cat => cat.id === categoryFilter || cat.name === categoryFilter)
      );
    }
    
    setFiltered(result);
  }, [search, statusFilter, categoryFilter, articles, isAdmin]);

  // Delete article
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
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire('Error', 'Failed to delete article', 'error');
      }
    }
  };

  // Restore article (admin only)
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
      } catch (error) {
        console.error("Restore error:", error);
        Swal.fire('Error', 'Failed to restore article', 'error');
      }
    }
  };

  // Permanently delete article (admin only)
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
      } catch (error) {
        console.error("Permanent delete error:", error);
        Swal.fire('Error', 'Failed to delete article', 'error');
      }
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      published: 'bg-success',
      draft: 'bg-warning',
      under_review: 'bg-info',
      archived: 'bg-secondary',
      pending: 'bg-warning'
    };
    return <span className={`badge ${colors[status] || 'bg-secondary'} text-white`}>
      {status?.replace('_', ' ') || 'unknown'}
    </span>;
  };

  // Check if current user is the author
  const isAuthor = (article) => {
    return currentUser?.uuid === article.created_by;
  };

  return (
    <MainLayout>
      <div className="container-fluid py-4">
        {/* Header with Role Badge */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Wiki Articles</h2>
            <p className="text-muted mb-0">
              {filtered.length} articles found
              {isAdmin && !rolesLoading && (
                <span className="ms-2 badge bg-danger">
                  <FaShieldAlt className="me-1" /> Admin
                </span>
              )}
              {!isAdmin && userRoles.length > 0 && !rolesLoading && (
                <span className="ms-2 badge bg-info">
                  <FaUserCog className="me-1" /> {userRoles[0]?.name || 'User'}
                </span>
              )}
            </p>
          </div>
          <Link to="/wiki/articles/create" className="btn btn-primary">
            <FaPlus className="me-2" /> New Article
          </Link>
        </div>

        {/* User Roles Info - Visible to all users */}
        {!rolesLoading && userRoles.length > 0 && (
          <div className="alert alert-light d-flex align-items-center mb-4 border">
            <FaUserTie className="me-3 text-primary" size={24} />
            <div>
              <strong>Your Roles:</strong>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {userRoles.map(role => (
                  <span key={role.id} className="badge bg-secondary">
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Admin Info Banner - Only visible to admins */}
        {isAdmin && (
          <div className="alert alert-info d-flex align-items-center mb-4">
            <FaShieldAlt className="me-3" size={24} />
            <div>
              <strong>Admin Dashboard</strong>
              <p className="mb-0 small">
                You have administrative privileges based on your roles: {userRoles.map(r => r.name).join(', ')}. 
                Total Articles: {articles.length} | 
                Published: {articles.filter(a => a.status === 'published').length} | 
                Drafts: {articles.filter(a => a.status === 'draft').length} | 
                Archived: {articles.filter(a => a.status === 'archived').length}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    className="form-control"
                    placeholder="Search by title, author, or content..."
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
                  {isAdmin && <option value="archived">Archived</option>}
                </select>
              </div>
              <div className="col-md-4">
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

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h6>Total Articles</h6>
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
                <h6>Drafts</h6>
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

        {/* Admin Stats - Only visible to admins */}
        {isAdmin && (
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card border-danger">
                <div className="card-body">
                  <h6 className="text-danger">
                    <FaBan className="me-2" /> Archived Articles
                  </h6>
                  <h3>{articles.filter(a => a.status === 'archived').length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-warning">
                <div className="card-body">
                  <h6 className="text-warning">
                    <FaHistory className="me-2" /> Under Review
                  </h6>
                  <h3>{articles.filter(a => a.status === 'under_review').length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-info">
                <div className="card-body">
                  <h6 className="text-info">
                    <FaUser className="me-2" /> Unique Authors
                  </h6>
                  <h3>{new Set(articles.map(a => a.created_by).filter(Boolean)).size}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Table */}
        <div className="card">
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Articles List</h5>
              <span className="badge bg-secondary">{filtered.length} items</span>
            </div>
          </div>
          <div className="card-body">
            {loading || rolesLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-2">No articles found</p>
                <Link to="/wiki/articles/create" className="btn btn-primary btn-sm">
                  <FaPlus className="me-2" /> Create First Article
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Categories</th>
                      <th>Views</th>
                      <th>Created</th>
                      <th>Updated</th>
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
                            <div className="small text-muted">{article.slug}</div>
                          </div>
                        </td>
                        
                        <td>
                          <div>
                            <FaUser className="me-1 text-muted small" />
                            {article.author_name || 'Unknown'}
                          </div>
                          {/* Show IP only to admins */}
                          {isAdmin && article.ip_address && (
                            <div className="small text-muted">
                              <FaGlobe className="me-1" /> {article.ip_address}
                            </div>
                          )}
                        </td>
                        
                        <td>{getStatusBadge(article.status)}</td>
                        
                        <td>
                          {article.categories && article.categories.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {article.categories.slice(0, 2).map(cat => (
                                <span key={cat.id} className="badge bg-secondary">
                                  {cat.name}
                                </span>
                              ))}
                              {article.categories.length > 2 && (
                                <span className="badge bg-secondary">+{article.categories.length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        
                        <td>{article.view_count || 0}</td>
                        
                        <td>
                          <div>
                            <FaCalendar className="me-1 text-muted small" />
                            {new Date(article.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        
                        <td>
                          <div>
                            <FaHistory className="me-1 text-muted small" />
                            {new Date(article.updated_at).toLocaleDateString()}
                          </div>
                        </td>
                        
                        <td className="text-end">
                          {/* View button - visible to everyone */}
                          <Link
                            to={`/wiki/articles/${article.slug || article.id}`}
                            className="btn btn-sm btn-outline-info me-1"
                            title="View Article"
                          >
                            <FaEye />
                          </Link>

                          {/* Edit button - visible if user can edit or is author of draft */}
                          {(userPermissions.canEdit || isAuthor(article) || isAdmin) && (
                            <Link
                              to={`/wiki/articles/edit/${article.id}`}
                              className="btn btn-sm btn-outline-warning me-1"
                              title="Edit Article"
                            >
                              <FaEdit />
                            </Link>
                          )}

                          {/* Delete/Restore buttons */}
                          {article.status === 'archived' ? (
                            // Archived article actions - admins only
                            isAdmin && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success me-1"
                                  onClick={() => restore(article.id, article.title)}
                                  title="Restore Article"
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
                            // Non-archived article - delete if user has permission
                            (userPermissions.canDelete || isAuthor(article) || isAdmin) && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => remove(article.id, article.title)}
                                title="Delete Article"
                              >
                                <FaTrash />
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Table Footer with Summary */}
          <div className="card-footer bg-white text-muted small">
            <div className="d-flex justify-content-between">
              <span>
                Showing {filtered.length} of {articles.length} articles
              </span>
              {isAdmin && (
                <span>
                  <FaShieldAlt className="me-1 text-danger" />
                  Admin: You can see all articles including archived ones
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}