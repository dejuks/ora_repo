import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

export default function ReviewerAssignmentDetailPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${API}/oraebook/reviewer/assignments/${assignmentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setData(res.data.data);
  };

const respond = async (action) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    console.log("Sending Action:", action);
    console.log("Assignment ID:", assignmentId);

    const response = await axios.post(
      `${API}/oraebook/reviewer/${assignmentId}/respond`,
      {
        action: action,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SERVER RESPONSE:", response.data);

    if (response.data.success) {
      alert(`Assignment ${action} successfully`);

      // reload updated assignment
      await load();
    } else {
      alert(response.data.message || "Action failed");
    }

  } catch (error) {
    console.error("FULL ERROR:", error);

    // backend response
    if (error.response) {
      console.log("STATUS:", error.response.status);
      console.log("DATA:", error.response.data);

      alert(
        error.response.data?.message ||
        error.response.data?.error ||
        "Server error"
      );
    } else {
      alert("Network error");
    }
  }
};

  if (!data) return <div>Loading...</div>;

  const fileUrl = data.file_path
    ? `${API}/${data.file_path}`
    : null;

  return (
    <MainLayout>
      <div className="container mt-4">

        <h3>{data.title}</h3>

        <p><b>Status:</b> {data.status}</p>
        <p><b>Language:</b> {data.language}</p>
        <p><b>Publication Year:</b> {data.publication_year}</p>
        <p><b>ISBN:</b> {data.isbn}</p>
        <p><b>Round:</b> {data.round_no}</p>

        <hr />

        <h5>Abstract</h5>
        <p>{data.abstract}</p>

        {/* ✅ PDF VIEW */}
        {fileUrl && (
          <iframe
            src={fileUrl}
            width="100%"
            height="500px"
            title="PDF Viewer"
          />
        )}

        <div className="mt-3">

          {/* ASSIGNED */}
          {data.status === "assigned" && (
            <>
              <button
                className="btn btn-success me-2"
                onClick={() => respond("accepted")}
              >
                Accept
              </button>

              <button
                className="btn btn-danger"
                onClick={() => respond("declined")}
              >
                Decline
              </button>
            </>
          )}

          {/* ACCEPTED */}
          {data.status === "accepted" && (
            <button
              className="btn btn-primary"
              onClick={() =>
                navigate(`/reviewer/review/${assignmentId}`)
              }
            >
              Start Review
            </button>
          )}

        </div>

      </div>
    </MainLayout>
  );
}