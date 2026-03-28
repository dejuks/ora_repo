import React, { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getDashboardStats } from "../../api/repository.api";
import { FaFileUpload, FaSync, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Bar,ResponsiveContainer,
  BarChart
} from "recharts";

export default function RepositoryDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboardStats();
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const stats = data?.stats || {};
  const trends = data?.trends || [];

const cards = [
  { title: "Total", value: Number(stats.total), icon: <FaFileUpload />, color: "blue" },
  { title: "Submitted", value: Number(stats.submitted), icon: <FaSync />, color: "yellow" },
  { title: "Approved", value: Number(stats.approved), icon: <FaCheckCircle />, color: "green" },
  { title: "Rejected", value: Number(stats.rejected), icon: <FaTimesCircle />, color: "red" },
  { title: "Draft", value: Number(stats.draft), icon: <FaClock />, color: "purple" },
];

  return (
    <MainLayout>
      <div className="container mt-4">

        <h2 className="mb-4">📊 Repository Dashboard</h2>

        {/* ================= STATS ================= */}
        <div className="row">
          {cards.map((c, i) => (
            <div className="col-md-3 mb-3" key={i}>
              <div className={`card border-${c.color}`}>
                <div className="card-body text-center">
                  <div style={{ fontSize: 24 }}>{c.icon}</div>
                  <h4>{c.value || 0}</h4>
                  <p>{c.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= CHART ================= */}
        <div className="card mt-4">
          <div className="card-header">
            <h5>📈 Monthly Trends</h5>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <ResponsiveContainer width="100%" height={300}>
  <BarChart data={trends}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />

    {/* Bars for each status */}
    <Bar dataKey="submitted" fill="#3B82F6" />
    <Bar dataKey="approved" fill="#10B981" />
    <Bar dataKey="rejected" fill="#EF4444" />
  </BarChart>
</ResponsiveContainer>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}