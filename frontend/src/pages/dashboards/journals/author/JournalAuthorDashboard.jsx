import React, { useEffect, useState } from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { getManuscripts } from "../../../../api/manuscript.api";

export default function JournalAuthorDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    pending: 0,
  });

  const [chartData, setChartData] = useState([]);

  const COLORS = ["#28a745", "#ffc107", "#17a2b8"];

  useEffect(() => {
    loadDashboard();
  }, []);

  const normalizeStatus = (status) => {
    if (!status) return "unknown";
    return status.toLowerCase().trim();
  };

  const loadDashboard = async () => {
    try {
      const res = await getManuscripts();

      // SAFE EXTRACTION FROM API
      const raw =
        res?.data?.rows ||
        res?.data?.data ||
        res?.data ||
        [];

      const allData = Array.isArray(raw) ? raw : [];

      // GET LOGGED USER
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const userUUID = String(currentUser?.uuid || "");

      // FILTER USING created_by UUID
      const myData = allData.filter(
        (m) => String(m?.created_by) === userUUID
      );

      // STATUS COUNT USING REDUCER
      const counts = myData.reduce(
        (acc, m) => {
          const status = normalizeStatus(m?.status_label);

          acc.total += 1;

          if (status.includes("publish")) acc.published += 1;
          else if (status.includes("draft")) acc.drafts += 1;
          else if (status.includes("pending")) acc.pending += 1;

          return acc;
        },
        { total: 0, published: 0, drafts: 0, pending: 0 }
      );

      setStats(counts);

      // CHART DATA
      setChartData([
        { name: "Published", value: counts.published },
        { name: "Drafts", value: counts.drafts },
        { name: "Pending Review", value: counts.pending },
      ]);
    } catch (err) {
      console.error("Dashboard error:", err);
      alert("Failed to load dashboard");
    }
  };

  return (
    <MainLayout>
      <section className="content-header">
        <div className="container-fluid">
          <h1>My Author Dashboard</h1>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          {/* SUMMARY BOXES */}
          <div className="row">
            <StatBox title="Total Manuscripts" value={stats.total} color="info" icon="fas fa-book" />
            <StatBox title="Published" value={stats.published} color="success" icon="fas fa-check" />
            <StatBox title="Drafts" value={stats.drafts} color="warning" icon="fas fa-edit" />
            <StatBox title="Pending Review" value={stats.pending} color="danger" icon="fas fa-clock" />
          </div>

          {/* CHARTS */}
          <div className="row">
            <ChartCard title="Status Bar Chart">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#007bff" />
              </BarChart>
            </ChartCard>

            <ChartCard title="Status Line Chart">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#28a745" />
              </LineChart>
            </ChartCard>

            <ChartCard title="Status Pie Chart">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {["#28a745", "#ffc107", "#17a2b8"].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ChartCard>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

// ===============================
function ChartCard({ title, children }) {
  return (
    <div className="col-lg-4">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="card-body" style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ===============================
function StatBox({ title, value, color, icon }) {
  return (
    <div className="col-lg-3 col-6">
      <div className={`small-box bg-${color}`}>
        <div className="inner">
          <h3>{value}</h3>
          <p>{title}</p>
        </div>
        <div className="icon">
          <i className={icon}></i>
        </div>
      </div>
    </div>
  );
}
