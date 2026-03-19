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

  // Fetch only submitted items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getItems({ status: "submitted" });

      // Frontend safety filter
      const submittedItems = res.data.filter(item => item.status === "submitted");

      setItems(submittedItems);

      // Stats
      setStats({
        total: submittedItems.length,
        pending: submittedItems.length,
      });
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
      submitted: { label: "Awaiting Review", badgeClass: "badge-warning", icon: "fas fa-clock" },
      approved: { label: "Approved", badgeClass: "badge-success", icon: "fas fa-check-circle" },
      rejected: { label: "Rejected", badgeClass: "badge-danger", icon: "fas fa-times-circle" },
      revision_required: { label: "Revision Required", badgeClass: "badge-info", icon: "fas fa-edit" },
    };
    const config = statusConfig[status] || { label: status, badgeClass: "badge-secondary", icon: "fas fa-info-circle" };
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
      customClass: { popup: 'rounded-lg', title: 'text-dark' }
    });

    if (confirm.isConfirmed) {
      await updateItem(id, { status: "approved" });
      Swal.fire({ title: "Approved!", text: "Item published successfully", icon: "success", timer: 1500, showConfirmButton: false, background: "#d4edda", color: "#155724" });
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
      inputAttributes: { rows: 4 },
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Confirm Rejection",
      cancelButtonText: "Cancel",
      background: "#f8f9fa",
      customClass: { popup: 'rounded-lg', title: 'text-dark', input: 'form-control' }
    });

    if (reason) {
      await updateItem(id, { status: "rejected", rejection_reason: reason });
      Swal.fire({ title: "Rejected!", text: "Item has been rejected", icon: "error", timer: 1500, showConfirmButton: false, background: "#f8d7da", color: "#721c24" });
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
      inputAttributes: { rows: 4 },
      showCancelButton: true,
      confirmButtonColor: "#17a2b8",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Send Revision Request",
      cancelButtonText: "Cancel",
      background: "#f8f9fa",
      customClass: { popup: 'rounded-lg', title: 'text-dark', input: 'form-control' }
    });

    if (comment) {
      await updateItem(id, { status: "revision_required", curator_comment: comment });
      Swal.fire({ title: "Sent!", text: "Revision request sent to author", icon: "info", timer: 1500, showConfirmButton: false, background: "#d1ecf1", color: "#0c5460" });
      fetchItems();
    }
  };

  // Filter items by search input
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.author_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.item_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          {/* Header & Stats */}
          <div className="row mb-4">
            <div className="col-lg-8 col-md-6 col-sm-12">
              <h1 className="m-0 text-dark"><i className="fas fa-tasks mr-2 text-primary"></i> Curator Queue</h1>
              <span className="badge badge-pill badge-primary ml-3 py-1 px-3">New Submissions</span>
              <p className="text-muted mb-0">Review and manage submitted repository items</p>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="row">
                <div className="col-6">
                  <div className="info-box bg-gradient-info shadow-sm">
                    <span className="info-box-icon"><i className="fas fa-hourglass-half"></i></span>
                    <div className="info-box-content">
                      <span className="info-box-text">Pending Review</span>
                      <span className="info-box-number">{stats.pending}</span>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="info-box bg-gradient-success shadow-sm">
                    <span className="info-box-icon"><i className="fas fa-clipboard-list"></i></span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Items</span>
                      <span className="info-box-number">{stats.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="card card-primary card-outline mb-4">
            <div className="card-header">
              <h3 className="card-title"><i className="fas fa-search mr-1"></i> Search & Filter</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Search by title, author, or type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <button onClick={fetchItems} className="btn btn-outline-primary btn-block btn-lg" disabled={loading}>
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''} mr-2`}></i> Refresh List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card card-primary card-outline">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">Loading submissions...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-5">No submissions found</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.uuid}>
                          <td>{item.title}</td>
                          <td>{item.item_type}</td>
                          <td>{item.author_name}</td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td className="text-center">
                            <Link to={`/repository/curator/review/${item.uuid}`} className="btn btn-info btn-sm mr-1">
                              <i className="fas fa-eye"></i>
                            </Link>
                            <button className="btn btn-success btn-sm mr-1" onClick={() => approveItem(item.id)}>
                              <i className="fas fa-check"></i>
                            </button>
                            <button className="btn btn-warning btn-sm mr-1" onClick={() => requestRevision(item.id)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => rejectItem(item.id)}>
                              <i className="fas fa-times"></i>
                            </button>
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
  return iconMap[type?.toLowerCase()] || iconMap.default;
}
