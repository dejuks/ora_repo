import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../../components/layout/MainLayout";

const API = process.env.REACT_APP_API_URL;

export default function EbookReviewPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    originality_score: "",
    clarity_score: "",
    methodology_score: "",
    relevance_score: "",
    comments_for_author: "",
    confidential_comments: "",
    recommendation: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${API}/oraebook/reviewer/${assignmentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setData(res.data.data);
  };

  const submit = async () => {
    const token = localStorage.getItem("token");

    await axios.post(
      `${API}/oraebook/reviewer/${assignmentId}/submit`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Review submitted");
    navigate("/reviewer/pending");
  };

  if (!data) return <div>Loading...</div>;

  return (
    <MainLayout>
      <div className="container mt-4">

        <h3>{data.title}</h3>
        <p>{data.abstract}</p>

        <h4 className="mt-4">Review</h4>

        <input className="form-control mt-2" placeholder="Originality"
          onChange={(e)=>setForm({...form, originality_score:e.target.value})} />

        <input className="form-control mt-2" placeholder="Clarity"
          onChange={(e)=>setForm({...form, clarity_score:e.target.value})} />

        <input className="form-control mt-2" placeholder="Methodology"
          onChange={(e)=>setForm({...form, methodology_score:e.target.value})} />

        <input className="form-control mt-2" placeholder="Relevance"
          onChange={(e)=>setForm({...form, relevance_score:e.target.value})} />

        <textarea className="form-control mt-2" placeholder="Comments"
          onChange={(e)=>setForm({...form, comments_for_author:e.target.value})} />

        <select className="form-control mt-2"
          onChange={(e)=>setForm({...form, recommendation:e.target.value})}>
          <option value="">Select</option>
          <option value="accept">Accept</option>
          <option value="minor_revision">Minor</option>
          <option value="major_revision">Major</option>
          <option value="reject">Reject</option>
        </select>

        <button className="btn btn-success mt-3" onClick={submit}>
          Submit Review
        </button>

      </div>
    </MainLayout>
  );
}