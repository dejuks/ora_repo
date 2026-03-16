import React, { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Swal from "sweetalert2";
import { getDepositsUnderReview } from "../../api/repository.api";

const DepositsUnderReview = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const itemsPerPage = 10;

  // =========================
  // FETCH DATA
  // =========================
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getDepositsUnderReview();
      setItems(res.data);
      setFiltered(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load deposits", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // =========================
  // SEARCH
  // =========================
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.item_type.toLowerCase().includes(q) ||
          item.language.toLowerCase().includes(q)
      )
    );
    setCurrentPage(1);
  }, [search, items]);

  // =========================
  // PAGINATION
  // =========================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // =========================
  // LOCK BODY SCROLL WHEN MODAL OPEN
  // =========================
  useEffect(() => {
    if (selectedItem) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [selectedItem]);

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          <div className="card card-outline card-warning">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-hourglass-half mr-2"></i>
                My Deposits Under Review
              </h3>

              <div className="card-tools">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "200px" }}
                />
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              {loading ? (
                <p className="p-3">Loading...</p>
              ) : currentItems.length === 0 ? (
                <p className="p-3">No items under review.</p>
              ) : (
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Language</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => (
                      <tr key={item.uuid}>
                        <td>{item.title}</td>
                        <td>{item.item_type}</td>
                        <td>{item.language}</td>
                        <td>
                          <span className="badge badge-warning">
                            {item.status}
                          </span>
                        </td>
                        <td>
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => setSelectedItem(item)}
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="card-footer clearfix">
                <ul className="pagination pagination-sm float-right">
                  {Array.from({ length: totalPages }, (_, i) => (
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
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================
          MODAL (SCROLLABLE)
      ========================= */}
      {selectedItem && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setSelectedItem(null)}
          ></div>

          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-file-alt mr-2"></i>
                    Repository Item Details
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setSelectedItem(null)}
                  >
                    <span>&times;</span>
                  </button>
                </div>

                <div
                  className="modal-body"
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                  <p><b>Title:</b> {selectedItem.title}</p>
                  <p><b>Type:</b> {selectedItem.item_type}</p>
                  <p><b>Language:</b> {selectedItem.language}</p>
                  <p><b>Status:</b> {selectedItem.status}</p>
                  <p><b>Access Level:</b> {selectedItem.access_level}</p>

                  <hr />

                  <h6>Abstract</h6>
                  <div
                    className="border p-2 bg-light"
                    style={{ whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedItem.abstract ||
                        "<em>No abstract provided</em>",
                    }}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedItem(null)}
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default DepositsUnderReview;
