import MainLayout from "../../components/layout/MainLayout";
import { reportedContentMock } from "../../mock/wikiModeration.mock";

export default function ReportedContentPage() {
  const getSeverityColor = level => {
    if (level === "critical") return "bg-danger";
    if (level === "high") return "bg-warning";
    return "bg-info";
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">

          <h2 className="mb-4">Reported Content Queue 🚨</h2>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                Moderation Review Requests
              </h3>
            </div>

            <div className="card-body table-responsive">
              <table className="table table-hover">

                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Reported By</th>
                    <th>Reason</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Assigned Moderator</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {reportedContentMock.map(item => (
                    <tr key={item.id}>

                      <td>{item.articleTitle}</td>
                      <td>{item.reportedBy}</td>
                      <td>{item.reason}</td>

                      <td>
                        <span>
                          {item.severity}
                        </span>
                      </td>

                      <td>
                        <span>
                          {item.status}
                        </span>
                      </td>

                      <td>{item.assignedModerator}</td>

                      <td>
                        <button className="btn btn-success btn-sm mr-2">
                          Resolve
                        </button>

                        <button className="btn btn-danger btn-sm">
                          Suppress
                        </button>
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