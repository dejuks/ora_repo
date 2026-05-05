import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout.jsx";
import ebookApi from "../../../../api/authorebookApi.js";
import StatusBadge from "../../components/StatusBadge.jsx";

function StageQueueCard({
  title,
  value,
  description,
  to,
  buttonLabel,
  tone,
}) {
  return (
    <div className="col-lg-3 col-md-6 mb-3">
      <div className={`card card-outline card-${tone} h-100`}>
        <div className="card-body d-flex flex-column">
          <div className="text-muted text-sm mb-2">{title}</div>
          <h2 className="mb-2">{value}</h2>
          <p className="text-muted mb-3">{description}</p>

          <Link className={`btn btn-${tone} mt-auto`} to={to}>
            {buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthorDashboardPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id || user?.user_id || user?.uuid;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState([]);

  const [queues, setQueues] = useState({
    revisions: 0,
    payments: 0,
    proofs: 0,
    rejected: 0,
    published: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await ebookApi.listMySubmissions({
          author_id: userId,
          limit: 100,
        });

        const rows = res?.rows || [];

        setSubmissions(rows);

        setQueues({
          revisions: rows.filter(
            (s) =>
              s.stage === "revisions" ||
              s.status === "revision_requested"
          ).length,

          payments: rows.filter(
            (s) =>
              s.stage === "payments" ||
              s.status === "payment_pending"
          ).length,

          proofs: rows.filter(
            (s) =>
              s.stage === "proofs" ||
              s.status === "proof_pending"
          ).length,

          rejected: rows.filter(
            (s) => s.status === "rejected"
          ).length,

          published: rows.filter(
            (s) =>
              s.status === "published" ||
              s.stage === "published"
          ).length,
        });

      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (userId) load();
  }, [userId]);

  return (
    <MainLayout>
      <section className="content-header mb-3">
        <div className="card card-outline card-primary">
          <div className="card-body">
            <h1>My eBook Dashboard</h1>
            <p className="text-muted">
              Manage your manuscripts, revisions, payments and publications.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {loading ? (
        <div className="card">
          <div className="card-body">
            Loading dashboard...
          </div>
        </div>
      ) : (
        <>
          {/* QUEUE CARDS */}
          <div className="row mb-3">

            <StageQueueCard
              title="My Submissions"
              value={submissions.length}
              description="All manuscripts you submitted"
              to="/ebook/manuscripts/my-submissions"
              buttonLabel="View All"
              tone="primary"
            />

            <StageQueueCard
              title="Published Works"
              value={queues.published}
              description="Published eBooks"
              to="/ebook/my-published"
              buttonLabel="View Published"
              tone="success"
            />

            <StageQueueCard
              title="Revision Requests"
              value={queues.revisions}
              description="Pending revisions"
              to="/ebook/my-revisions"
              buttonLabel="Handle Revisions"
              tone="warning"
            />

            <StageQueueCard
              title="Pending Payments"
              value={queues.payments}
              description="Awaiting payment"
              to="/ebook/my-payments"
              buttonLabel="View Payments"
              tone="danger"
            />

            <StageQueueCard
              title="Proof Approvals"
              value={queues.proofs}
              description="Ready for confirmation"
              to="/ebook/my-proofs"
              buttonLabel="Review Proofs"
              tone="info"
            />

          </div>

          {/* RECENT SUBMISSIONS TABLE */}

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                My Recent Submissions
              </h3>
            </div>

            <div className="card-body table-responsive p-0">
              <table className="table table-hover">

                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {!submissions.length ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No submissions yet.
                      </td>
                    </tr>
                  ) : (
                    submissions.slice(0, 10).map((row) => (
                      <tr key={row.submission_id}>

                        <td>
                          <strong>{row.title}</strong>
                        </td>

                        <td>
                          <StatusBadge
                            value={row.status || "draft"}
                          />
                        </td>

                        <td>
                          {row.created_at
                            ? new Date(
                                row.created_at
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          <Link
                            className="btn btn-sm btn-outline-primary"
                            to={`/ebook/submissions/${row.submission_id}`}
                          >
                            View
                          </Link>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>
          </div>

          {/* SUCCESS MESSAGE */}

          {queues.published > 0 && (
            <div className="card mt-3 bg-success bg-opacity-10">
              <div className="card-body d-flex justify-content-between">

                <div>
                  <h5>🎉 Congratulations!</h5>

                  <p className="text-muted">
                    You have {queues.published} published
                    eBook
                    {queues.published !== 1 ? "s" : ""}
                  </p>
                </div>

                <Link
                  to="/ebook/my-published"
                  className="btn btn-success"
                >
                  View Published Works
                </Link>

              </div>
            </div>
          )}

        </>
      )}
    </MainLayout>
  );
}