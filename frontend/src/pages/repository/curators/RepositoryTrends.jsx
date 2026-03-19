import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { getItems } from "../../../api/repository.api";
import axios from "axios";
import Swal from "sweetalert2";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

// GET USERS
const getUsers = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get("http://localhost:5000/api/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export default function RepositoryTrends() {
  const [loading, setLoading] = useState(true);
  const [submittedItems, setSubmittedItems] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const itemsRes = await getItems();
        const usersRes = await getUsers();

        const submitted = itemsRes.data.filter(
          (item) => item.status === "submitted"
        );

        setSubmittedItems(submitted);
        setUsers(usersRes);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to load trends data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===============================
     1️⃣ SUBMISSIONS BY MONTH
  =============================== */
  const submissionsByMonth = submittedItems.reduce((acc, item) => {
    const date = new Date(item.created_at);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const monthLabels = Object.keys(submissionsByMonth).sort();
  const monthCounts = monthLabels.map((m) => submissionsByMonth[m]);

  /* ===============================
     2️⃣ SUBMISSIONS BY AUTHOR
  =============================== */
  const submissionsByAuthor = submittedItems.reduce((acc, item) => {
    acc[item.submitter_id] = (acc[item.submitter_id] || 0) + 1;
    return acc;
  }, {});

  const authorStats = Object.entries(submissionsByAuthor)
    .map(([id, count]) => {
      const user = users.find(
        (u) => u.uuid === id || u.id === id
      );
      return {
        name: user?.full_name || "Unknown",
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // top 10

  /* ===============================
     3️⃣ KPI VALUES
  =============================== */
  const totalSubmissions = submittedItems.length;
  const totalAuthors = Object.keys(submissionsByAuthor).length;
  const avgPerAuthor =
    totalAuthors === 0 ? 0 : (totalSubmissions / totalAuthors).toFixed(2);

  /* ===============================
     CHART DATA
  =============================== */
  const lineChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Submissions",
        data: monthCounts,
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const barChartData = {
    labels: authorStats.map((a) => a.name),
    datasets: [
      {
        label: "Submissions",
        data: authorStats.map((a) => a.count),
      },
    ],
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-chart-line mr-2"></i>
                Repository Submission Trends
              </h3>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin mr-2"></i> Loading trends...
                </div>
              ) : (
                <>
                  {/* ================= KPI ROW ================= */}
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="small-box bg-info">
                        <div className="inner">
                          <h3>{totalSubmissions}</h3>
                          <p>Total Submissions</p>
                        </div>
                        <div className="icon">
                          <i className="fas fa-upload"></i>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="small-box bg-success">
                        <div className="inner">
                          <h3>{totalAuthors}</h3>
                          <p>Active Authors</p>
                        </div>
                        <div className="icon">
                          <i className="fas fa-users"></i>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="small-box bg-warning">
                        <div className="inner">
                          <h3>{avgPerAuthor}</h3>
                          <p>Avg Submissions / Author</p>
                        </div>
                        <div className="icon">
                          <i className="fas fa-chart-pie"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================= CHARTS ================= */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title">
                            Submissions Over Time
                          </h3>
                        </div>
                        <div className="card-body">
                          <Line data={lineChartData} />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title">
                            Top Authors by Submissions
                          </h3>
                        </div>
                        <div className="card-body">
                          <Bar data={barChartData} />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
