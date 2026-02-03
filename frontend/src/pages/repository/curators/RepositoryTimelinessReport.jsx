import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { getItems } from "../../../api/repository.api";
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

export default function RepositoryTimelinessReport() {
  const [loading, setLoading] = useState(true);
  const [processedItems, setProcessedItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const itemsRes = await getItems();

        const processed = itemsRes.data.filter(
          (item) =>
            item.status === "processed" ||
            item.status === "approved"
        );

        setProcessedItems(processed);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to load processing time data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===============================
     CALCULATE PROCESSING TIME (DAYS) - from created_at to updated_at
  =============================== */
  const processingData = processedItems.map((item) => {
    const submitted = new Date(item.created_at);
    const updated = new Date(item.updated_at);
    const days =
      (updated - submitted) / (1000 * 60 * 60 * 24);

    return {
      ...item,
      days: Math.max(days, 0),
    };
  });

  /* ===============================
     KPI VALUES
  =============================== */
  const totalProcessed = processingData.length;

  const avgProcessingTime =
    totalProcessed === 0
      ? 0
      : (
          processingData.reduce((sum, i) => sum + i.days, 0) /
          totalProcessed
        ).toFixed(2);

  const maxProcessingTime =
    totalProcessed === 0
      ? 0
      : Math.max(...processingData.map((i) => i.days)).toFixed(2);

  /* ===============================
     AVG PROCESSING TIME BY MONTH
  =============================== */
  const byMonth = {};

  processingData.forEach((item) => {
    const d = new Date(item.created_at);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(item.days);
  });

  const monthLabels = Object.keys(byMonth).sort();
  const avgByMonth = monthLabels.map((m) => {
    const vals = byMonth[m];
    return (
      vals.reduce((a, b) => a + b, 0) / vals.length
    ).toFixed(2);
  });

  /* ===============================
     PROCESSING TIME DISTRIBUTION
  =============================== */
  const buckets = {
    "0–3 days": 0,
    "4–7 days": 0,
    "8–14 days": 0,
    "15+ days": 0,
  };

  processingData.forEach((i) => {
    if (i.days <= 3) buckets["0–3 days"]++;
    else if (i.days <= 7) buckets["4–7 days"]++;
    else if (i.days <= 14) buckets["8–14 days"]++;
    else buckets["15+ days"]++;
  });

  /* ===============================
     CHART DATA
  =============================== */
  const lineChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Avg Processing Time (Days)",
        data: avgByMonth,
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(buckets),
    datasets: [
      {
        label: "Items",
        data: Object.values(buckets),
      },
    ],
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="card card-warning card-outline">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-clock mr-2"></i>
                Repository Processing Time Report
              </h3>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Loading processing metrics...
                </div>
              ) : (
                <>
                  {/* ================= KPI ROW ================= */}
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="small-box bg-info">
                        <div className="inner">
                          <h3>{totalProcessed}</h3>
                          <p>Total Processed Items</p>
                        </div>
                        <div className="icon">
                          <i className="fas fa-check-circle"></i>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="small-box bg-success">
                        <div className="inner">
                          <h3>{avgProcessingTime}</h3>
                          <p>Avg Processing Time (Days)</p>
                          <small>Created to Updated</small>
                        </div>
                        <div className="icon">
                          <i className="fas fa-stopwatch"></i>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="small-box bg-danger">
                        <div className="inner">
                          <h3>{maxProcessingTime}</h3>
                          <p>Max Processing Time (Days)</p>
                          <small>Created to Updated</small>
                        </div>
                        <div className="icon">
                          <i className="fas fa-hourglass-end"></i>
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
                            Avg Processing Time Over Time
                          </h3>
                          <small className="text-muted">
                            From creation to last update
                          </small>
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
                            Processing Time Distribution
                          </h3>
                          <small className="text-muted">
                            Days from creation to last update
                          </small>
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