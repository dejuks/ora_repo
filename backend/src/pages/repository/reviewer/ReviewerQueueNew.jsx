import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import {
  getReviewerNewQueue,
  claimItemForReview,
  bulkClaimItems,
} from "../../../api/repository.api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function ReviewerQueueNew() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [filters, setFilters] = useState({
    priority: "all",
    category: "all",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  /* ===============================
     LOAD REVIEWER QUEUE
  =============================== */
  useEffect(() => {
    const loadQueue = async () => {
      try {
        setLoading(true);
        const res = await getReviewerNewQueue();
        setItems(res.data);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to load reviewer queue", "error");
      } finally {
        setLoading(false);
      }
    };

    loadQueue();
  }, []);

  /* ===============================
     FILTER + SORT
  =============================== */
  const filteredItems = useMemo(() => {
    let data = [...items];

    if (filters.priority !== "all") {
      data = data.filter((i) => i.priority === filters.priority);
    }

    if (filters.category !== "all") {
      data = data.filter((i) => i.category === filters.category);
    }

    data.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];

      return filters.sortOrder === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
          ? 1
          : -1;
    });

    return data;
  }, [items, filters]);

  /* ===============================
     HELPERS
  =============================== */
  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredItems.length
        ? []
        : filteredItems.map((i) => i.id),
    );
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
    return diff === 0 ? "Today" : `${diff} day(s) ago`;
  };

  /* ===============================
     ACTIONS
  =============================== */
  const claimSingle = async (id) => {
    const confirm = await Swal.fire({
      title: "Claim this item?",
      icon: "question",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await claimItemForReview(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      Swal.fire("Success", "Item claimed", "success");
    } catch {
      Swal.fire("Error", "Failed to claim item", "error");
    }
  };
  const truncateText = (text, length = 30) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const [expandedRows, setExpandedRows] = useState({});
  const toggleReadMore = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const claimBulk = async () => {
    if (selectedItems.length === 0) return;

    try {
      await bulkClaimItems(selectedItems);
      setItems((prev) => prev.filter((i) => !selectedItems.includes(i.id)));
      setSelectedItems([]);
      Swal.fire("Success", "Items claimed", "success");
    } catch {
      Swal.fire("Error", "Bulk claim failed", "error");
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-inbox mr-2"></i>
                Reviewer Queue (New)
              </h3>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Loading items...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-check-circle fa-3x mb-2"></i>
                  <h5>No items pending review</h5>
                </div>
              ) : (
                <>
                  {/* ACTION BAR */}
                  <div className="mb-3">
                    <button
                      className="btn btn-default"
                      disabled={!selectedItems.length}
                      onClick={claimBulk}
                    >
                      <i className="fas fa-hand-paper mr-1"></i>
                      Claim Selected ({selectedItems.length})
                    </button>
                  </div>

                  {/* TABLE */}
                  <div className="table-responsive">
                    <table className="table table-hover table-bordered">
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              checked={
                                selectedItems.length === filteredItems.length
                              }
                              onChange={toggleSelectAll}
                            />
                          </th>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Abstract</th>
                          <th>Type</th>
                          <th>Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleSelect(item.id)}
                              />
                            </td>
                            <td>#{item.id}</td>
                            <td>
                              <span
                                className="text-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  navigate(
                                    `/repository/reviewer/review/${item.uuid}`,
                                  )
                                }
                              >
                                {item.title}
                              </span>
                            </td>
                            <td
                              style={{
                                maxWidth: "350px",
                                whiteSpace: "normal",
                              }}
                            >
                              {expandedRows[item.uuid]
                                ? item.abstract
                                : truncateText(item.abstract, 30)}

                              {item.abstract && item.abstract.length > 30 && (
                                <button
                                  className="btn btn-link btn-sm p-0 ml-1"
                                  onClick={() => toggleReadMore(item.uuid)}
                                >
                                  {expandedRows[item.uuid]
                                    ? "Read less"
                                    : "Read more"}
                                </button>
                              )}
                            </td>

                            <td>{item.item_type}</td>
                            <td>{timeAgo(item.created_at)}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-success mr-1"
                                onClick={() => claimSingle(item.uuid)}
                              >
                                <i className="fas fa-hand-paper"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() =>
                                  navigate(
                                    `/repository/reviewer/review/${item.uuid}`,
                                  )
                                }
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
