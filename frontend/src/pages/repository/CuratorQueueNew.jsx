import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import {
  getCuratorNewQueue,
  approveItem,
  rejectItem,
  requestRevision,
} from "../../api/repository.api";

export default function CuratorQueueNew() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch new submissions
  const fetchItems = async () => {
    try {
      const res = await getCuratorNewQueue();
      setItems(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch submissions", "error");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Approve
  const handleApprove = async (uuid) => {
    const confirm = await Swal.fire({
      title: "Approve this item?",
      text: "This will publish the repository item",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      confirmButtonText: "Approve",
    });

    if (confirm.isConfirmed) {
      await approveItem(uuid);
      Swal.fire("Approved!", "Item published successfully", "success");
      fetchItems();
    }
  };

  // Reject
  const handleReject = async (uuid) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Item",
      input: "textarea",
      inputLabel: "Rejection Reason",
      inputPlaceholder: "Enter reason for rejection...",
      showCancelButton: true,
    });

    if (reason) {
      await rejectItem(uuid, reason);
      Swal.fire("Rejected!", "Item has been rejected", "success");
      fetchItems();
    }
  };

  // Request Revision
  const handleRevision = async (uuid) => {
    const { value: comment } = await Swal.fire({
      title: "Request Revision",
      input: "textarea",
      inputLabel: "Message to Author",
      inputPlaceholder: "Describe required changes...",
      showCancelButton: true,
    });

    if (comment) {
      await requestRevision(uuid, comment);
      Swal.fire("Sent!", "Revision request sent to author", "success");
      fetchItems();
    }
  };

  // Filter by search
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          {/* HEADER */}
          <div className="row mb-3">
            <div className="col-sm-6">
              <h1>Curator Queue – New Submissions</h1>
            </div>
          </div>

          {/* TABLE */}
          <div className="card card-outline card-primary">
            <div className="card-header">
              <h3 className="card-title">Submitted Items</h3>
              <div className="card-tools">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ width: 250 }}
                  placeholder="Search title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              <table className="table table-hover table-striped">
                <thead className="bg-primary">
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th width="280">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No new submissions
                      </td>
                    </tr>
                  )}

                  {filteredItems.map((item) => (
                    <tr key={item.uuid}>
                      <td>{item.title}</td>
                      <td>{item.item_type}</td>
                      <td>{item.full_name}</td>
                      <td>
                        <span className="badge badge-warning">
                          {item.status}
                        </span>
                      </td>

                      <td>
                        {/* REVIEW */}
                        <Link
                          to={`/repository/curator/review/${item.uuid}`}
                          className="btn btn-sm btn-primary mr-1"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>

                        {/* APPROVE */}
                        <button
                          className="btn btn-sm btn-success mr-1"
                          onClick={() => handleApprove(item.uuid)}
                        >
                          <i className="fas fa-check"></i>
                        </button>

                        {/* REVISION */}
                        <button
                          className="btn btn-sm btn-warning mr-1"
                          onClick={() => handleRevision(item.uuid)}
                        >
                          <i className="fas fa-undo"></i>
                        </button>

                        {/* REJECT */}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(item.uuid)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
