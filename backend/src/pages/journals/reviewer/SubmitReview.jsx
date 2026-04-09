import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import MainLayout from "../../../components/layout/MainLayout";
import { submitReviewAPI } from "../../../api/reviewer.api";

export default function SubmitReview() {
  const { manuscriptId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    recommendation: "",
    confidential_comments: "",
    comments_to_author: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitReview = async () => {
    try {
      setLoading(true);

      await submitReviewAPI({
        manuscript_id: manuscriptId,
        ...form,
      });

      Swal.fire("Success", "Review submitted", "success");

      navigate("/journal/reviewer/workspace");

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Submission failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 max-w-3xl mx-auto">

        <h2 className="text-xl font-bold mb-4">
          Submit Review
        </h2>

        {/* Recommendation */}
        <select
          name="recommendation"
          value={form.recommendation}
          onChange={handleChange}
          className="border w-full p-2 mb-3"
        >
          <option value="">Select Recommendation</option>
          <option value="accept">Accept</option>
          <option value="minor_revision">Minor Revision</option>
          <option value="major_revision">Major Revision</option>
          <option value="reject">Reject</option>
        </select>

        {/* Confidential */}
        <textarea
          name="confidential_comments"
          placeholder="Confidential Comments to Editor"
          value={form.confidential_comments}
          onChange={handleChange}
          className="border w-full p-2 mb-3"
        />

        {/* Author */}
        <textarea
          name="comments_to_author"
          placeholder="Comments to Author"
          value={form.comments_to_author}
          onChange={handleChange}
          className="border w-full p-2 mb-3"
        />

        <button
          onClick={submitReview}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>

      </div>
    </MainLayout>
  );
}
