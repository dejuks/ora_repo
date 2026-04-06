import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { communityPoliciesMock } from "../../mock/wikiGlobalGovernance.mock";

export default function CommunityPoliciesPage() {
  const [policies] = useState(communityPoliciesMock);

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">
          <div className="d-flex justify-content-between mb-3">
            <h2>Community Policies</h2>
            <button className="btn btn-primary">New Policy</button>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Smaller Wiki Governance Policies</h3>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Community</th>
                    <th>Policy Name</th>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((item) => (
                    <tr key={item.id}>
                      <td>{item.communityName}</td>
                      <td>{item.policyName}</td>
                      <td>{item.policyKey}</td>
                      <td>{item.policyValue}</td>
                      <td>
                        <span className={`badge ${
                          item.status === "active"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.updatedAt}</td>
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