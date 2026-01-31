import React, { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Swal from "sweetalert2";
import { getReturnedDeposits } from "../../api/repository.api";

const DepositsReturned = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getReturnedDeposits();
      setItems(res.data);
      setFiltered(res.data);
    } catch (error) {
      Swal.fire("Error", "Failed to load returned deposits", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* 🔍 Search */
  useEffect(() => {
    const result = items.filter(
      (i) =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.item_type.toLowerCase().includes(search.toLowerCase()) ||
        i.language.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, items]);

  /* 📄 Pagination */
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const openModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">

          <div className="card card-danger">
            <div className="card-header">
              <h3 className="card-title">
                Deposits Returned for Corrections
              </h3>

              <div className="card-tools">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 200 }}
                />
              </div>
            </div>

            <div className="card-body table-responsive p-0">
              {loading ? (
                <p className="p-3">Loading...</p>
              ) : paginated.length === 0 ? (
                <p className="p-3">
                  No deposits returned for correction.
                </p>
              ) : (
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Language</th>
                      <th>Status</th>
                      <th>Returned On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item) => (
                      <tr key={item.uuid}>
                        <td>{item.title}</td>
                        <td>{item.item_type}</td>
                        <td>{item.language}</td>
                        <td>
                          <span className="badge badge-danger">
                            Returned
                          </span>
                        </td>
                        <td>
                          {new Date(item.updated_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => openModal(item)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="card-footer clearfix">
              <ul className="pagination pagination-sm m-0 float-right">
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
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MODAL ================= */}
      {showModal && selectedItem && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">

              <div className="modal-header bg-danger">
                <h5 className="modal-title">
                  Returned Deposit Details
                </h5>
                <button className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <dl className="row">
                  <dt className="col-sm-4">Title</dt>
                  <dd className="col-sm-8">{selectedItem.title}</dd>

                  <dt className="col-sm-4">Type</dt>
                  <dd className="col-sm-8">{selectedItem.item_type}</dd>

                  <dt className="col-sm-4">Language</dt>
                  <dd className="col-sm-8">{selectedItem.language}</dd>

                  <dt className="col-sm-4">Abstract</dt>
                  <dd className="col-sm-8">
                    {selectedItem.abstract || "N/A"}
                  </dd>

                  <dt className="col-sm-4">Correction Note</dt>
                  <dd className="col-sm-8 text-danger">
                    {selectedItem.correction_note || "No note provided"}
                  </dd>

                  <dt className="col-sm-4">Returned On</dt>
                  <dd className="col-sm-8">
                    {new Date(selectedItem.updated_at).toLocaleString()}
                  </dd>
                </dl>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button className="btn btn-warning">
                  Edit & Resubmit
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default DepositsReturned;
