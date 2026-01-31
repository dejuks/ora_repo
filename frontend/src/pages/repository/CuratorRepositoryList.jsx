import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getItems, updateItem } from "../../api/repository.api";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";

export default function CuratorRepositoryList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0 });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getItems({
        status: "submitted",
      });
      setItems(res.data);
      
      // Calculate stats
      const total = res.data.length;
      const pending = res.data.filter(item => item.status === "submitted").length;
      setStats({ total, pending });
    } catch (error) {
      console.error("Failed to fetch items:", error);
      Swal.fire("Error", "Failed to load submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Status badge with AdminLTE colors
  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { 
        label: "Awaiting Review", 
        badgeClass: "badge-warning",
        icon: "fas fa-clock"
      },
      approved: { 
        label: "Approved", 
        badgeClass: "badge-success",
        icon: "fas fa-check-circle"
      },
      rejected: { 
        label: "Rejected", 
        badgeClass: "badge-danger",
        icon: "fas fa-times-circle"
      },
      revision_required: { 
        label: "Revision Required", 
        badgeClass: "badge-info",
        icon: "fas fa-edit"
      }
    };

    const config = statusConfig[status] || { 
      label: status, 
      badgeClass: "badge-secondary",
      icon: "fas fa-info-circle"
    };

    return (
      <span className={`badge ${config.badgeClass} p-2`}>
        <i className={`${config.icon} mr-1`}></i>
        {config.label}
      </span>
    );
  };

  /* ================= APPROVE ================= */
  const approveItem = async (id) => {
    const confirm = await Swal.fire({
      title: "Approve this item?",
      text: "This will publish the repository item",
      icon: "question",
      iconColor: "#28a745",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Approve!",
      cancelButtonText: "Cancel",
      background: "#f8f9fa",
      customClass: {
        popup: 'rounded-lg',
        title: 'text-dark',
      }
    });

    if (confirm.isConfirmed) {
      await updateItem(id, { status: "approved" });
      Swal.fire({
        title: "Approved!",
        text: "Item published successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#d4edda",
        color: "#155724"
      });
      fetchItems();
    }
  };

  /* ================= REJECT ================= */
  const rejectItem = async (id) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Item",
      input: "textarea",
      inputLabel: "Rejection Reason",
      inputPlaceholder: "Enter detailed reason...",
      inputAttributes: {
        rows: 4
      },
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Confirm Rejection",
      cancelButtonText: "Cancel",
      background: "#f8f9fa",
      customClass: {
        popup: 'rounded-lg',
        title: 'text-dark',
        input: 'form-control'
      }
    });

    if (reason) {
      await updateItem(id, {
        status: "rejected",
        rejection_reason: reason,
      });
      Swal.fire({
        title: "Rejected!",
        text: "Item has been rejected",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8d7da",
        color: "#721c24"
      });
      fetchItems();
    }
  };

  /* ================= REVISION ================= */
  const requestRevision = async (id) => {
    const { value: comment } = await Swal.fire({
      title: "Request Revision",
      input: "textarea",
      inputLabel: "Message to Author",
      inputPlaceholder: "Describe required changes...",
      inputAttributes: {
        rows: 4
      },
      showCancelButton: true,
      confirmButtonColor: "#17a2b8",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Send Revision Request",
      cancelButtonText: "Cancel",
      background: "#f8f9fa",
      customClass: {
        popup: 'rounded-lg',
        title: 'text-dark',
        input: 'form-control'
      }
    });

    if (comment) {
      await updateItem(id, {
        status: "revision_required",
        curator_comment: comment,
      });
      Swal.fire({
        title: "Sent!",
        text: "Revision request sent to author",
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
        background: "#d1ecf1",
        color: "#0c5460"
      });
      fetchItems();
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.author_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.item_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          
          {/* HEADER WITH STATS CARDS */}
          <div className="row mb-4">
            <div className="col-lg-8 col-md-6 col-sm-12">
              <div className="d-flex align-items-center mb-3">
                <h1 className="m-0 text-dark">
                  <i className="fas fa-tasks mr-2 text-primary"></i>
                  Curator Queue
                </h1>
                <span className="badge badge-pill badge-primary ml-3 py-1 px-3">
                  New Submissions
                </span>
              </div>
              <p className="text-muted mb-0">Review and manage submitted repository items</p>
            </div>
            
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="row">
                <div className="col-6">
                  <div className="info-box bg-gradient-info shadow-sm">
                    <span className="info-box-icon">
                      <i className="fas fa-hourglass-half"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Pending Review</span>
                      <span className="info-box-number">{stats.pending}</span>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="info-box bg-gradient-success shadow-sm">
                    <span className="info-box-icon">
                      <i className="fas fa-clipboard-list"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Items</span>
                      <span className="info-box-number">{stats.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH AND FILTER CARD */}
          <div className="card card-primary card-outline mb-4">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-search mr-1"></i>
                Search & Filter
              </h3>
              <div className="card-tools">
                <button 
                  type="button" 
                  className="btn btn-tool" 
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Search by title, author, or type..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <button
                    onClick={fetchItems}
                    className="btn btn-outline-primary btn-block btn-lg"
                    disabled={loading}
                  >
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''} mr-2`}></i>
                    Refresh List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN TABLE CARD */}
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-list-alt mr-1"></i>
                Submitted Items ({filteredItems.length})
              </h3>
              <div className="card-tools">
                <div className="input-group input-group-sm" style={{ width: 200 }}>
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-filter"></i>
                    </span>
                  </div>
                  <select className="form-control form-control-sm">
                    <option>All Types</option>
                    <option>Article</option>
                    <option>Dataset</option>
                    <option>Video</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading submissions...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h4 className="text-muted">No submissions found</h4>
                  <p className="text-muted">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead className="bg-light-blue">
                      <tr>
                        <th width="30%">Title</th>
                        <th width="15%">Type</th>
                        <th width="20%">Author</th>
                        <th width="15%">Status</th>
                        <th width="20%" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.uuid}>
                          <td>
                            <div className="d-flex align-items-start">
                              <div className="mr-3">
                                <span className="badge badge-light">
                                  <i className={`fas fa-${getItemTypeIcon(item.item_type)} text-primary`}></i>
                                </span>
                              </div>
                              <div>
                                <strong className="d-block">{item.title}</strong>
                                <small className="text-muted">ID: {item.uuid}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-light border border-primary text-primary">
                              {item.item_type}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="mr-2">
                                <span className="user-avatar bg-purple rounded-circle d-inline-flex align-items-center justify-content-center" 
                                      style={{width: '30px', height: '30px', color: 'white', fontSize: '14px'}}>
                                  {item.author_name?.charAt(0) || 'A'}
                                </span>
                              </div>
                              <span>{item.author_name}</span>
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(item.status)}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <Link
                                to={`/repository/curator/review/${item.uuid}`}
                                className="btn btn-info"
                                title="Review Details"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
                              
                              <button
                                className="btn btn-success"
                                onClick={() => approveItem(item.id)}
                                title="Approve Item"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              
                              <button
                                className="btn btn-warning"
                                onClick={() => requestRevision(item.id)}
                                title="Request Revision"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              
                              <button
                                className="btn btn-danger"
                                onClick={() => rejectItem(item.id)}
                                title="Reject Item"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* CARD FOOTER */}
            <div className="card-footer clearfix">
              <div className="row">
                <div className="col-md-6">
                  <div className="legend d-flex align-items-center">
                    <strong className="mr-3">Legend:</strong>
                    <span className="badge badge-warning mr-2">Awaiting Review</span>
                    <span className="badge badge-success mr-2">Approved</span>
                    <span className="badge badge-info mr-2">Revision</span>
                    <span className="badge badge-danger">Rejected</span>
                  </div>
                </div>
                <div className="col-md-6 text-right">
                  <span className="text-muted">
                    Showing {filteredItems.length} of {items.length} items
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

// Helper function for item type icons
function getItemTypeIcon(type) {
  const iconMap = {
    article: 'file-alt',
    dataset: 'database',
    video: 'video',
    image: 'image',
    audio: 'music',
    document: 'file',
    presentation: 'file-powerpoint',
    code: 'code',
    default: 'file'
  };
  
  const normalizedType = type?.toLowerCase() || 'default';
  return iconMap[normalizedType] || iconMap.default;
}