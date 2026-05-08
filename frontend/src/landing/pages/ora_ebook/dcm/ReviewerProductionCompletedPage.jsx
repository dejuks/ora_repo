// src/pages/ebook/production/ReviewerProductionCompletedPage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

export default function ReviewerProductionCompletedPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null);

  const [showPayment, setShowPayment] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "bank",
    note: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API}/oraebook/reviewer/production/completed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRows(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load completed production reviews");
    } finally {
      setLoading(false);
    }
  };

  const submitPaymentOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/oraebook/reviewer/production/payment-orders`,
        {
          assignment_id: selected.assignment_id,
          amount: paymentForm.amount,
          payment_method: paymentForm.payment_method,
          note: paymentForm.note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Payment order created successfully");

      setShowPayment(false);

      setPaymentForm({
        amount: "",
        payment_method: "bank",
        note: "",
      });
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to create payment order"
      );
    }
  };

  return (
    <MainLayout>
      <div
        className="container-fluid py-4"
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
        }}
      >

        {/* HEADER */}
        <div className="card border-0 shadow-lg mb-4">
          <div
            className="card-body text-white"
            style={{
              background:
                "linear-gradient(135deg,#0f172a,#1e293b)",
              borderRadius: "20px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">

              <div>
                <h2 className="fw-bold mb-1">
                  Production Completed Reviews
                </h2>
                <p className="mb-0 opacity-75">
                  Manage reviewer production payment orders
                </p>
              </div>

              <div
                className="text-center px-4 py-3"
                style={{
                  background: "rgba(255,255,255,.1)",
                  borderRadius: "18px",
                  minWidth: "120px",
                }}
              >
                <div style={{ fontSize: "32px", fontWeight: "bold" }}>
                  {rows.length}
                </div>
                <small>Total Reviews</small>
              </div>

            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card border-0 shadow-lg" style={{ borderRadius: "20px" }}>
          <div className="card-body p-0">

            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : rows.length === 0 ? (
              <div className="p-5 text-center">
                <h4>No completed reviews</h4>
              </div>
            ) : (
              <div className="table-responsive">

                <table className="table align-middle mb-0">

                  <thead
                    style={{
                      backgroundColor: "#0f172a",
                      color: "white",
                    }}
                  >
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3">Title</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Completed</th>
                      <th className="py-3 text-center" style={{ width: "90px" }}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((item, i) => (
                      <tr key={item.assignment_id}>
                        <td className="fw-bold text-primary px-4">
                          {i + 1}
                        </td>

                        <td>
                          <div className="fw-bold">{item.title}</div>
                          <small className="text-muted">
                            ID: {item.assignment_id}
                          </small>
                        </td>

                        <td>
                          <span
                            className="badge"
                            style={{
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              padding: "8px 14px",
                              borderRadius: "30px",
                            }}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td>
                          {item.completed_at
                            ? new Date(item.completed_at).toLocaleString()
                            : "-"}
                        </td>

                        {/* ACTION (ONLY CHANGE IS LABEL INSIDE DROPDOWN) */}
                        <td className="text-center" style={{ position: "relative" }}>

                          <button
                            className="btn btn-light border"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              fontSize: "20px",
                              fontWeight: "bold",
                            }}
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === item.assignment_id
                                  ? null
                                  : item.assignment_id
                              )
                            }
                          >
                            ⋮
                          </button>

                          {openDropdown === item.assignment_id && (
                            <div
                              className="shadow bg-white"
                              style={{
                                position: "absolute",
                                right: 0,
                                top: "50px",
                                minWidth: "180px",
                                borderRadius: "12px",
                                zIndex: 1000,
                                overflow: "hidden",
                              }}
                            >
                              <button
                                className="dropdown-item py-3"
                                onClick={() => {
                                  setSelected(item);
                                  setOpenDropdown(null);
                                }}
                              >
                                {item.payment_status === "ordered"
                                  ? "💰 View Payment"
                                  : "👁 View Details"}
                              </button>
                            </div>
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

      {/* MODAL (UNCHANGED) */}
      {selected && (
        <div
          className="modal show"
          style={{
            display: "block",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">

            <div className="modal-content border-0" style={{ borderRadius: "24px" }}>

              <div className="modal-header bg-dark text-white">
                <h3>{selected.title}</h3>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setSelected(null)}
                />
              </div>

              <div className="modal-body bg-light">

                <p><b>Status:</b> {selected.status}</p>
                <p><b>Language:</b> {selected.language}</p>
                <p><b>Recommendation:</b> {selected.recommendation}</p>
                <p><b>Abstract:</b> {selected.abstract}</p>

                <button
                  className="btn btn-success mt-3"
                  onClick={() => setShowPayment(!showPayment)}
                >
                  Order Payment
                </button>

                {showPayment && (
                  <div className="mt-3 p-3 bg-white border rounded">

                    <input
                      className="form-control mb-2"
                      placeholder="Amount"
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          amount: e.target.value,
                        })
                      }
                    />

                    <select
                      className="form-select mb-2"
                      value={paymentForm.payment_method}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          payment_method: e.target.value,
                        })
                      }
                    >
                      <option value="bank">Bank</option>
                      <option value="telebirr">Telebirr</option>
                      <option value="cash">Cash</option>
                    </select>

                    <textarea
                      className="form-control mb-2"
                      placeholder="Note"
                      value={paymentForm.note}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          note: e.target.value,
                        })
                      }
                    />

                    <button
                      className="btn btn-primary"
                      onClick={submitPaymentOrder}
                    >
                      Submit Payment Order
                    </button>

                  </div>
                )}

              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </MainLayout>
  );
}