import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../../../components/layout/MainLayout";

import {
  getManuscripts,
  deleteManuscript,
  inviteAuthor,
} from "../../../../api/manuscript.api";

import { getAuthors } from "../../../../api/user.api";

export default function ManuscriptList() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  /* ================= LOAD ================= */
  const loadManuscripts = async () => {
    try {
      setLoading(true);
      const res = await getManuscripts();
      setManuscripts(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load manuscripts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManuscripts();
  }, []);

  /* ================= FILTER ================= */
  const filtered = manuscripts.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.journal_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / perPage);

  /* ================= DELETE ================= */
  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete manuscript?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (!confirm.isConfirmed) return;

    await deleteManuscript(id);
    Swal.fire("Deleted", "", "success");
    loadManuscripts();
  };

  /* ================= INVITE CO-AUTHOR ================= */
const invitePopup = async (manuscriptId) => {
  try {
    const authorsRes = await getAuthors();
    const authors = authorsRes.data;

    if (!authors.length) return Swal.fire("No authors found");

    // Get logged-in user
    const loggedUser = JSON.parse(localStorage.getItem("user")); // { uuid, full_name, email, ... }
    if (!loggedUser) return Swal.fire("Error", "Logged-in user not found", "error");

    const { value } = await Swal.fire({
      title: "Invite Co-Author",
      html: `
        <label>Inviter (You):</label>
        <input type="text" id="inviter" class="swal2-input" value="${loggedUser.full_name}" disabled />

        <label style="margin-top:10px">Co-Author:</label>
        <select id="coauthor" class="swal2-input">
          ${authors
            .filter(a => a.uuid !== loggedUser.uuid) // exclude yourself
            .map(a => `<option value="${a.uuid}">${a.full_name} (${a.email})</option>`)
            .join("")}
        </select>

        <label style="margin-top:10px">
          <input type="checkbox" id="corresponding" />
          Corresponding author
        </label>
      `,
      showCancelButton: true,
      preConfirm: () => ({
        invited_by: loggedUser.uuid,                      // UUID of logged-in user
        user_id: document.getElementById("coauthor").value, // UUID of selected co-author
        corresponding: document.getElementById("corresponding").checked,
      }),
    });

    if (!value) return;

    await inviteAuthor(manuscriptId, value);

    Swal.fire("Success", "Author invited", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Invite failed", "error");
  }
};



  /* ================= UI ================= */
  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>Manuscript Management</h1>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary">
            <div className="card-header d-flex justify-content-between align-items-center">
  {/* Left side: Title */}
  <h3 className="card-title mb-0">Manuscripts</h3>

  {/* Right side: Search + Create */}
  <div className="d-flex align-items-center gap-2">
    <input
      className="form-control form-control-sm"
      style={{ width: 250 }}
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
    />

    <Link
  to={`/journal/manuscraipts/create`}
      className="btn btn-sm btn-info"
    >
      Create New
    </Link>
  </div>
</div>


            <div className="card-body table-responsive p-0">
              {loading ? (
                <p className="text-center py-5">Loading...</p>
              ) : (
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Journal</th>
                      <th>Section</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((m, i) => (
                      <tr key={m.id}>
                        <td>{indexOfFirst + i + 1}</td>
                        <td>{m.title}</td>
                        <td>{m.journal_title}</td>
                        <td>{m.section_name || "-"}</td>
                        <td>
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>

                        <td>
                          <div className="btn-group">
                            <Link
                              to={`/journal/manuscripts/show/${m.id}`}
                              className="btn btn-info btn-sm"
                            >
                              <i className="fa fa-eye" />
                            </Link>

                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => invitePopup(m.id)}
                              title="Invite Co-Author"
                            >
                              <i className="fas fa-user-plus" />
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => remove(m.id)}
                            >
                              <i className="fas fa-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer">
                <ul className="pagination pagination-sm float-right">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
