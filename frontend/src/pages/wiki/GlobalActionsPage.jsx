import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { globalActionsMock } from "../../mock/wikiGlobalGovernance.mock";

export default function GlobalActionsPage() {
  const [actions] = useState(globalActionsMock);

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">
          <div className="d-flex justify-content-between mb-3">
            <h2>Global Actions</h2>
            <div>
              <button className="btn btn-warning mr-2">Rename User</button>
              <button className="btn btn-danger">Lock Account</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Global Rename / Lock Actions</h3>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action Type</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.username}</td>
                      <td>{item.actionType}</td>
                      <td>{item.oldValue || "-"}</td>
                      <td>{item.newValue || "-"}</td>
                      <td>{item.reason}</td>
                      <td>
                        <span className={`badge ${
                          item.status === "approved"
                            ? "bg-success"
                            : item.status === "pending"
                            ? "bg-warning text-dark"
                            : "bg-info"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.createdAt}</td>
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