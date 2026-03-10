import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import { getDraftItems, submitDraft, deleteDraft } from "../../api/repository.api";
import { useNavigate } from "react-router-dom";

const DraftRepository = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await getDraftItems(); // backend returns only current user's drafts
      setDrafts(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch drafts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleDelete = async (uuid) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This draft will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDraft(uuid);
        Swal.fire("Deleted!", "Draft has been deleted.", "success");
        fetchDrafts();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to delete draft", "error");
      }
    }
  };

  const handleSubmit = async (uuid) => {
    const result = await Swal.fire({
      title: "Submit for review?",
      text: "Once submitted, it will go to curator review.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, submit",
    });

    if (result.isConfirmed) {
      try {
        await submitDraft(uuid);
        Swal.fire("Submitted!", "Draft has been submitted.", "success");
        fetchDrafts();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to submit draft", "error");
      }
    }
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <h3>My Draft Repository Items</h3>

          {loading ? (
            <p>Loading drafts...</p>
          ) : drafts.length === 0 ? (
            <p>No drafts found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="thead-light">
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Language</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((item) => (
                    <tr key={item.uuid}>
                      <td>{item.title}</td>
                      <td>{item.item_type}</td>
                      <td>{item.language}</td>
                      <td>{new Date(item.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary mr-1"
                          onClick={() => navigate(`/repository/edit/${item.uuid}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-success mr-1"
                          onClick={() => handleSubmit(item.uuid)}
                        >
                          Submit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item.uuid)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default DraftRepository;
