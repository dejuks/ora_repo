import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { governanceLogsMock } from "../../mock/wikiGlobalGovernance.mock";

export default function GovernanceLogsPage() {
  const [logs] = useState(governanceLogsMock);

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">
          <h2 className="mb-3">Activity Logs</h2>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Global Governance Logs</h3>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Context</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((item) => (
                    <tr key={item.id}>
                      <td>{item.actor}</td>
                      <td>{item.action}</td>
                      <td>{item.target}</td>
                      <td>{item.context}</td>
                      <td>{item.date}</td>
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