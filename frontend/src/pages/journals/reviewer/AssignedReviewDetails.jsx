import React from "react";
import MainLayout from "../../../components/layout/MainLayout";

function AssignedReviewDetails() {
  return (
    <MainLayout>
        <section className="content pt-4">
          <div className="container-fluid">

            {/* ================= TITLE ================= */}
            <div className="mb-4">
              <h2 className="font-weight-bold">
                A Novel Approach to Deep Learning–Based Natural Language
                Processing in Low-Resource Languages
              </h2>
            </div>

            {/* ================= WORKFLOW PROGRESS ================= */}
            <div className="card">
              <div className="card-body">
                <h5 className="font-weight-bold mb-4">Workflow Progress</h5>

                <div className="d-flex justify-content-between text-center">

                  <div>
                    <span className="badge badge-success p-3">1</span>
                    <p className="mt-2">Submitted</p>
                  </div>

                  <div className="flex-fill align-self-center">
                    <hr />
                  </div>

                  <div>
                    <span className="badge badge-success p-3">2</span>
                    <p className="mt-2">Screening</p>
                  </div>

                  <div className="flex-fill align-self-center">
                    <hr />
                  </div>

                  <div>
                    <span className="badge badge-primary p-3">3</span>
                    <p className="mt-2 font-weight-bold">Peer Review</p>
                  </div>

                  <div className="flex-fill align-self-center">
                    <hr />
                  </div>

                  <div>
                    <span className="badge badge-secondary p-3">4</span>
                    <p className="mt-2 text-muted">Revision</p>
                  </div>

                  <div className="flex-fill align-self-center">
                    <hr />
                  </div>

                  <div>
                    <span className="badge badge-secondary p-3">5</span>
                    <p className="mt-2 text-muted">Accepted</p>
                  </div>

                  <div className="flex-fill align-self-center">
                    <hr />
                  </div>

                  <div>
                    <span className="badge badge-secondary p-3">6</span>
                    <p className="mt-2 text-muted">Published</p>
                  </div>

                </div>
              </div>
            </div>

            {/* ================= MAIN CONTENT ================= */}
            <div className="row mt-4">

              {/* ===== Abstract ===== */}
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title font-weight-bold">Abstract</h5>
                  </div>
                  <div className="card-body">
                    <p>
                      This paper presents a novel framework for adapting large
                      language models to low-resource language settings. The
                      proposed approach integrates transfer learning,
                      multilingual embeddings, and adaptive fine-tuning to
                      improve model generalization across diverse linguistic
                      domains.
                    </p>

                    <hr />

                    <h6 className="font-weight-bold">Manuscript File</h6>
                    <button className="btn btn-outline-primary">
                      <i className="fas fa-file-pdf mr-2"></i>
                      Download Manuscript
                    </button>
                  </div>
                </div>
              </div>

              {/* ===== Details ===== */}
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title font-weight-bold">Details</h5>
                  </div>
                  <div className="card-body">

                    <p>
                      <i className="fas fa-user mr-2 text-primary"></i>
                      <strong>Authors:</strong><br />
                      Dr. Amina Hassan, Prof. Wei Chen
                    </p>

                    <hr />

                    <p>
                      <i className="fas fa-tag mr-2 text-primary"></i>
                      <strong>Category:</strong><br />
                      Artificial Intelligence
                    </p>

                    <hr />

                    <p>
                      <i className="fas fa-calendar mr-2 text-primary"></i>
                      <strong>Submitted:</strong><br />
                      2026-01-15
                    </p>

                    <hr />

                    <p>
                      <i className="fas fa-user-edit mr-2 text-primary"></i>
                      <strong>Assigned Editor:</strong><br />
                      Dr. Sarah Mitchell
                    </p>

                    <hr />

                    <p>
                      <i className="fas fa-users mr-2 text-primary"></i>
                      <strong>Reviewers:</strong><br />
                      Dr. James Park,<br />
                      Prof. Elena Rossi
                    </p>

                  </div>
                </div>
              </div>

            </div>

            {/* ================= REVIEW ACTION SECTION ================= */}
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="card-title font-weight-bold">
                  Reviewer Decision
                </h5>
              </div>
              <div className="card-body">

                <div className="form-group">
                  <label>Reviewer Comment</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Write your review comments..."
                  ></textarea>
                </div>

                <button className="btn btn-success mr-2">
                  <i className="fas fa-check mr-1"></i> Accept
                </button>

                <button className="btn btn-warning mr-2">
                  <i className="fas fa-edit mr-1"></i> Request Revision
                </button>

                <button className="btn btn-danger">
                  <i className="fas fa-times mr-1"></i> Reject
                </button>

              </div>
            </div>

          </div>
        </section>
    </MainLayout>
  );
}

export default AssignedReviewDetails;
