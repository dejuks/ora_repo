import { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { roleManagementMock } from "../../mock/wikiGlobalGovernance.mock";

export default function RoleManagementPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    return roleManagementMock.filter((item) => {
      const matchSearch =
        item.username.toLowerCase().includes(search.toLowerCase()) ||
        item.community.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "all" ? true : item.status === status;
      return matchSearch && matchStatus;
    });
  }, [search, status]);

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">
          <div className="d-flex justify-content-between mb-3">
            <h2>Role Management</h2>
            <button className="btn btn-primary">New Review</button>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <input
                    className="form-control"
                    placeholder="Search by user or community"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="under_review">Under Review</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Promotion / Demotion / Bot Reviews</h3>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Current Role</th>
                    <th>Requested Role</th>
                    <th>Type</th>
                    <th>Community</th>
                    <th>Trust</th>
                    <th>Performance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.id}>
                      <td>{item.username}</td>
                      <td>{item.currentRole}</td>
                      <td>{item.requestedRole}</td>
                      <td>{item.targetType}</td>
                      <td>{item.community}</td>
                      <td>{item.trustScore}%</td>
                      <td>{item.performanceScore}%</td>
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