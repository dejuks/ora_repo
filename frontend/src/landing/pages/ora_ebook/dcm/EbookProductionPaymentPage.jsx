import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

export default function EbookProductionPaymentPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [method, setMethod] = useState("telebirr");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${API}/oraebook/reviewer/production/payments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setRows(res.data.data || []);
    setLoading(false);
  };

  const markPaid = async () => {
    const token = localStorage.getItem("token");

    await axios.post(
      `${API}/oraebook/reviewer/production/payments/${selected.assignment_id}/paid`,
      { method },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Payment marked as paid");
    setSelected(null);
    load();
  };

  return (
    <MainLayout>
      <div className="container-fluid mt-4">

        {/* HEADER */}
        <div className="card p-3 mb-3 bg-dark text-white">
          <h3>Production Payment Orders</h3>
          <small>Completed manuscript payment management</small>
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="card-body">

            {loading ? (
              <div>Loading...</div>
            ) : (
              <table className="table table-hover">

                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Completed </th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((item, i) => (
                    <tr key={item.assignment_id}>

                      <td>{i + 1}</td>

                      <td>
                        <b>{item.title}</b>
                        <div className="text-muted small">
                          {item.language} 
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-success">
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            item.payment_status === "paid"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {item.payment_status}
                        </span>

                        <div className="small text-muted">
                          {item.payment_amount || 0} ETB
                        </div>
                      </td>

                      <td>
                        {item.completed_at
                          ? new Date(item.completed_at).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* ✅ ONLY CHANGE IS HERE */}
                      <td>
                        <button
                          className={`btn btn-sm ${
                            item.payment_status === "ordered"
                              ? "btn-info"
                              : "btn-primary"
                          }`}
                          onClick={() => setSelected(item)}
                        >
                          {item.payment_status === "ordered"
                            ? "View Order"
                            : "View"}
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>
        </div>

        {/* MODAL (UNCHANGED) */}
        {selected && (
          <div
            className="modal show d-block"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <div className="modal-dialog">

              <div className="modal-content">

                <div className="modal-header">
                  <h5>Payment Details</h5>
                  <button onClick={() => setSelected(null)}>
                    X
                  </button>
                </div>

                <div className="modal-body">

                  <p><b>Title:</b> {selected.title}</p>
                  <p><b>Amount:</b> {selected.payment_amount}</p>

                  <select
                    className="form-select"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="telebirr">Telebirr</option>
                    <option value="bank">Bank</option>
                    <option value="cash">Cash</option>
                  </select>

                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-success"
                    onClick={markPaid}
                  >
                    Mark as Paid
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}