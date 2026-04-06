import MainLayout from "../../components/layout/MainLayout";
import {
  suppressedRevisionsMock,
  checkUserInvestigationsMock,
  oversightAuditLogsMock,
} from "../../mock/wikiModeration.mock";

export default function WikiModerationDashboardPage() {
  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">

          <h2 className="mb-4">Oversight & CheckUser Dashboard 🛡️</h2>

          {/* SUPPRESSED REVISIONS */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Suppressed Revisions (Privacy Protection)</h3>
            </div>

            <div className="card-body table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Editor</th>
                    <th>Reason</th>
                    <th>Suppressed By</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {suppressedRevisionsMock.map(item => (
                    <tr key={item.id}>
                      <td>{item.articleTitle}</td>
                      <td>{item.editor}</td>
                      <td>{item.reason}</td>
                      <td>{item.suppressedBy}</td>
                      <td>{item.suppressedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {/* CHECKUSER */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">CheckUser Investigations 🌐</h3>
            </div>

            <div className="card-body table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>IP Address</th>
                    <th>User Agent</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {checkUserInvestigationsMock.map(item => (
                    <tr key={item.id}>
                      <td>{item.username}</td>
                      <td>{item.ipAddress}</td>
                      <td>{item.userAgent}</td>
                      <td>{item.investigationReason}</td>
                      <td>
                        <span className="badge bg-danger">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {/* AUDIT LOG */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Oversight Audit Trail 📜</h3>
            </div>

            <div className="card-body">
              <ul className="timeline timeline-inverse">

                {oversightAuditLogsMock.map(log => (
                  <li key={log.id}>
                    <i className="fas fa-user-secret bg-primary"></i>

                    <div className="timeline-item">
                      <span className="time">{log.timestamp}</span>

                      <h3 className="timeline-header">
                        {log.actor}
                      </h3>

                      <div className="timeline-body">
                        {log.action} → {log.target}
                        <br />
                        Reason: {log.reason}
                      </div>
                    </div>
                  </li>
                ))}

              </ul>
            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}