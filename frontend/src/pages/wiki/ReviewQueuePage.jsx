import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { reviewQueueMock } from "../../mock/wikiGlobalGovernance.mock";

export default function ReviewQueuePage() {
  const [queue] = useState(reviewQueueMock);

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">
          <h2 className="mb-3">Review Queue</h2>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Pending Governance Reviews</h3>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Target</th>
                    <th>Community</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => (
                    <tr key={item.id}>
                      <td>{item.type}</td>
                      <td>{item.target}</td>
                      <td>{item.community}</td>
                      <td>
                        <span className={`badge ${
                          item.priority === "high"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td>{item.status}</td>
                      <td>{item.submittedAt}</td>
                      <td>
                        <button className="btn btn-success btn-sm mr-1">Approve</button>
                        <button className="btn btn-danger btn-sm">Reject</button>
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