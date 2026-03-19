import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../../../components/layout/MainLayout";
import { getItems } from "../../../api/repository.api";
import { Link } from "react-router-dom";

export default function CollectionsByType() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const typesPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getItems();

        const submittedItems = res.data.filter(
          (item) => item.status === "submitted"
        );

        setItems(submittedItems);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to load collections", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Group by Resource Type
  const groupedByType = Object.values(
    items
      .filter((item) =>
        item.item_type?.toLowerCase().includes(search.toLowerCase())
      )
      .reduce((acc, item) => {
        const type = item.item_type || "Unknown";
        if (!acc[type]) {
          acc[type] = {
            type,
            items: [],
          };
        }
        acc[type].items.push(item);
        return acc;
      }, {})
  );

  // ✅ Pagination logic
  const totalPages = Math.ceil(groupedByType.length / typesPerPage);
  const startIndex = (currentPage - 1) * typesPerPage;
  const paginatedTypes = groupedByType.slice(
    startIndex,
    startIndex + typesPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getStatusBadge = (status) => {
    const map = {
      submitted: "badge-warning",
      approved: "badge-success",
      rejected: "badge-danger",
      revision_required: "badge-info",
    };
    return (
      <span className={`badge ${map[status] || "badge-secondary"} p-2`}>
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="card card-success card-outline">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title">
                <i className="fas fa-layer-group mr-2"></i>
                Collections by Resource Type
              </h3>

              <input
                type="text"
                className="form-control form-control-sm w-50"
                placeholder="Search resource type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin mr-2"></i> Loading...
                </div>
              ) : paginatedTypes.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  No collections found
                </div>
              ) : (
                paginatedTypes.map((group, index) => {
                  const sequenceNo = startIndex + index + 1;

                  return (
                    <div key={group.type} className="mb-4">
                      <h5 className="bg-success text-white p-2 rounded">
                        #{sequenceNo} — {group.type} ({group.items.length} item
                        {group.items.length > 1 ? "s" : ""})
                      </h5>

                      <table className="table table-bordered table-hover text-sm">
                        <thead className="thead-light">
                          <tr>
                            <th style={{ width: "60px" }}>No</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((item, i) => (
                            <tr key={item.uuid}>
                              <td>{i + 1}</td>
                              <td>{item.title}</td>
                              <td>{getStatusBadge(item.status)}</td>
                              <td className="text-center">
                                <Link
                                  to={`/repository/curator/review/${item.uuid}`}
                                  className="btn btn-info btn-sm"
                                >
                                  <i className="fas fa-eye"></i> View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })
              )}
            </div>

            {/* ✅ AdminLTE Pagination */}
            {totalPages > 1 && (
              <div className="card-footer clearfix">
                <ul className="pagination pagination-sm m-0 float-right">
                  <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                    <button
                      className="page-link"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      «
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      currentPage === totalPages && "disabled"
                    }`}
                  >
                    <button
                      className="page-link"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      »
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
