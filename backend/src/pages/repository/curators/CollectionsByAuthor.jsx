import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../../../components/layout/MainLayout";
import { getItems } from "../../../api/repository.api";
import axios from "axios";
import { Link } from "react-router-dom";

// GET USERS API
const getUsers = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get("http://localhost:5000/api/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export default function AuthorCollections() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // authors per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const itemsRes = await getItems();
        const usersRes = await getUsers();

        const submittedItems = itemsRes.data.filter(
          (item) => item.status === "submitted"
        );

        const itemsWithAuthor = submittedItems.map((item) => {
          const user = usersRes.find(
            (u) => u.uuid === item.submitter_id || u.id === item.submitter_id
          );
          return { ...item, full_name: user?.full_name || "Unknown" };
        });

        setItems(itemsWithAuthor);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to fetch items or users", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Group by Author
  const groupedByAuthor = Object.values(
    items
      .filter(
        (item) =>
          item.full_name.toLowerCase().includes(search.toLowerCase()) ||
          item.submitter_id.toLowerCase().includes(search.toLowerCase())
      )
      .reduce((acc, item) => {
        if (!acc[item.submitter_id]) {
          acc[item.submitter_id] = {
            submitter_id: item.submitter_id,
            full_name: item.full_name,
            items: [],
          };
        }
        acc[item.submitter_id].items.push(item);
        return acc;
      }, {})
  );

  // ✅ Pagination logic
  const totalPages = Math.ceil(groupedByAuthor.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAuthors = groupedByAuthor.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page on search
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
          <div className="card card-primary card-outline">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title">
                <i className="fas fa-users mr-2"></i> Collections by Author
              </h3>
              <input
                type="text"
                className="form-control form-control-sm w-50"
                placeholder="Search by author name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin mr-2"></i> Loading...
                </div>
              ) : paginatedAuthors.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  No collections found
                </div>
              ) : (
                paginatedAuthors.map((group, index) => {
                  // ✅ GLOBAL SEQUENCE NUMBER
                  const sequenceNo = startIndex + index + 1;

                  return (
                    <div key={group.submitter_id} className="mb-4">
                      <h5 className="bg-primary text-white p-2 rounded">
                        #{sequenceNo} — {group.full_name}  — {group.items.length} item(s)
                      </h5>

                      <table className="table table-hover table-bordered text-sm">
                        <thead className="thead-light">
                          <tr>
                            <th style={{ width: "60px" }}>No</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((item, i) => (
                            <tr key={item.uuid}>
                              <td>{i + 1}</td>
                              <td>{item.title}</td>
                              <td>{item.item_type}</td>
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
