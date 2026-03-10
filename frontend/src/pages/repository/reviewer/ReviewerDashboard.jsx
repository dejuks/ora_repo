import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { getItems } from "../../../api/repository.api";
import { getUsers } from "../../../api/user.api";
import Swal from "sweetalert2";
import { Bar, Doughnut, Line, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Tooltip,
  Legend
);

export default function ReviewerDashboard() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [reviewerStats, setReviewerStats] = useState({});
  const [timeRange, setTimeRange] = useState("month"); // month, quarter, year
  const [selectedReviewer, setSelectedReviewer] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both items and users data
        const [itemsRes, usersRes] = await Promise.all([
          getItems(),
          getUsers()
        ]);
        
        // Filter for reviewer-specific items (assuming reviewer_id field exists)
        const reviewItems = itemsRes.data.filter(
          (item) => item.reviewer_id || item.reviewed_by
        );
        
        setItems(reviewItems);
        
        // Filter users who are reviewers (assuming role field)
        const reviewerUsers = usersRes.data.filter(
          (user) => user.role === "reviewer" || user.permissions?.includes("review")
        );
        setReviewers(reviewerUsers);
        
        // Calculate reviewer statistics
        const stats = calculateReviewerStats(reviewItems, reviewerUsers);
        setReviewerStats(stats);
        
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to load reviewer dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===============================
     CALCULATE REVIEWER STATISTICS
  =============================== */
  const calculateReviewerStats = (items, reviewers) => {
    const stats = {};
    
    // Initialize all reviewers
    reviewers.forEach(reviewer => {
      const reviewerKey = reviewer.id;
      stats[reviewerKey] = {
        id: reviewer.id,
        name: reviewer.name || reviewer.username || reviewer.email,
        email: reviewer.email,
        role: reviewer.role,
        totalReviewed: 0,
        pendingReviews: 0,
        approvedCount: 0,
        rejectedCount: 0,
        returnedCount: 0,
        reviewTimes: [],
        monthlyStats: {},
        qualityScore: 0,
        efficiencyScore: 0,
        items: []
      };
    });
    
    // Process items
    items.forEach((item) => {
      const reviewerId = item.reviewer_id || item.reviewed_by;
      if (!reviewerId || !stats[reviewerId]) return;
      
      const stat = stats[reviewerId];
      stat.totalReviewed++;
      stat.items.push(item);
      
      // Track status
      if (item.status === "pending_review") {
        stat.pendingReviews++;
      } else if (item.status === "approved") {
        stat.approvedCount++;
      } else if (item.status === "rejected") {
        stat.rejectedCount++;
      } else if (item.status === "returned") {
        stat.returnedCount++;
      }
      
      // Calculate review time if reviewed
      if (item.reviewed_at && item.submitted_at) {
        const submitted = new Date(item.submitted_at || item.created_at);
        const reviewed = new Date(item.reviewed_at);
        const days = Math.max((reviewed - submitted) / (1000 * 60 * 60 * 24), 0);
        stat.reviewTimes.push(days);
      }
      
      // Monthly statistics
      const month = new Date(item.reviewed_at || item.updated_at).toISOString().slice(0, 7);
      if (!stat.monthlyStats[month]) {
        stat.monthlyStats[month] = { reviewed: 0, approved: 0, rejected: 0 };
      }
      stat.monthlyStats[month].reviewed++;
      if (item.status === "approved") stat.monthlyStats[month].approved++;
      if (item.status === "rejected") stat.monthlyStats[month].rejected++;
    });
    
    // Calculate derived metrics
    Object.keys(stats).forEach(reviewerId => {
      const stat = stats[reviewerId];
      
      // Average review time
      stat.avgReviewTime = stat.reviewTimes.length > 0 
        ? (stat.reviewTimes.reduce((a, b) => a + b, 0) / stat.reviewTimes.length).toFixed(2)
        : 0;
      
      // Approval rate
      stat.approvalRate = stat.totalReviewed > 0 
        ? ((stat.approvedCount / stat.totalReviewed) * 100).toFixed(1)
        : 0;
      
      // Rejection rate
      stat.rejectionRate = stat.totalReviewed > 0 
        ? ((stat.rejectedCount / stat.totalReviewed) * 100).toFixed(1)
        : 0;
      
      // Quality score (based on approval rate and low return rate)
      const returnRate = stat.totalReviewed > 0 
        ? (stat.returnedCount / stat.totalReviewed) * 100 
        : 0;
      stat.qualityScore = Math.max(0, 100 - (returnRate * 2) - ((100 - stat.approvalRate) / 2));
      
      // Efficiency score (based on review speed and volume)
      const speedScore = stat.avgReviewTime > 0 
        ? Math.max(0, 100 - (parseFloat(stat.avgReviewTime) * 5)) 
        : 50;
      const volumeScore = Math.min(100, stat.totalReviewed * 2);
      stat.efficiencyScore = ((speedScore * 0.3) + (volumeScore * 0.7)).toFixed(1);
      
      // Overall score
      stat.overallScore = ((parseFloat(stat.qualityScore) * 0.6) + (parseFloat(stat.efficiencyScore) * 0.4)).toFixed(1);
    });
    
    return stats;
  };

  /* ===============================
     DASHBOARD KPIs
  =============================== */
  const totalReviewers = reviewers.length;
  const totalItemsReviewed = items.filter(item => 
    item.status === "approved" || item.status === "rejected" || item.status === "returned"
  ).length;
  const pendingReviews = items.filter(item => item.status === "pending_review").length;
  
  // Overall approval rate
  const approvedItems = items.filter(item => item.status === "approved").length;
  const overallApprovalRate = totalItemsReviewed > 0 
    ? ((approvedItems / totalItemsReviewed) * 100).toFixed(1) 
    : 0;
  
  // Average review time across all reviewers
  const allReviewTimes = Object.values(reviewerStats).flatMap(stat => stat.reviewTimes);
  const overallAvgReviewTime = allReviewTimes.length > 0 
    ? (allReviewTimes.reduce((a, b) => a + b, 0) / allReviewTimes.length).toFixed(2)
    : 0;
  
  // Top performer
  const topPerformer = Object.entries(reviewerStats)
    .filter(([_, stat]) => stat.totalReviewed >= 5)
    .sort((a, b) => parseFloat(b[1].overallScore) - parseFloat(a[1].overallScore))[0] || null;
  
  /* ===============================
     CHART DATA PREPARATION
  =============================== */
  
  // 1. Reviewer workload distribution
  const reviewerNames = Object.values(reviewerStats).map(stat => stat.name);
  const workloadData = reviewerNames.map(name => {
    const reviewer = Object.values(reviewerStats).find(r => r.name === name);
    return reviewer ? reviewer.totalReviewed : 0;
  });
  
  const workloadChartData = {
    labels: reviewerNames,
    datasets: [
      {
        label: 'Total Reviewed',
        data: workloadData,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pending Reviews',
        data: reviewerNames.map(name => {
          const reviewer = Object.values(reviewerStats).find(r => r.name === name);
          return reviewer ? reviewer.pendingReviews : 0;
        }),
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      }
    ]
  };

  // 2. Review outcomes (pie chart)
  const totalApproved = Object.values(reviewerStats).reduce((sum, stat) => sum + stat.approvedCount, 0);
  const totalRejected = Object.values(reviewerStats).reduce((sum, stat) => sum + stat.rejectedCount, 0);
  const totalReturned = Object.values(reviewerStats).reduce((sum, stat) => sum + stat.returnedCount, 0);
  
  const outcomesChartData = {
    labels: ['Approved', 'Rejected', 'Returned'],
    datasets: [
      {
        data: [totalApproved, totalRejected, totalReturned],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };

  // 3. Performance metrics (radar/polar chart)
  const performanceMetrics = ['Quality', 'Efficiency', 'Speed', 'Volume', 'Consistency'];
  const selectedReviewerData = selectedReviewer === "all" 
    ? Object.values(reviewerStats)
    : [reviewerStats[selectedReviewer]];
  
  const performanceChartData = {
    labels: performanceMetrics,
    datasets: selectedReviewerData.map((reviewer, index) => ({
      label: reviewer.name,
      data: [
        parseFloat(reviewer.qualityScore) || 0,
        parseFloat(reviewer.efficiencyScore) || 0,
        reviewer.avgReviewTime > 0 ? Math.max(0, 100 - (reviewer.avgReviewTime * 10)) : 0,
        Math.min(100, reviewer.totalReviewed * 5),
        85 // Placeholder for consistency score
      ],
      backgroundColor: `rgba(${54 + index * 50}, ${162 + index * 30}, ${235}, 0.2)`,
      borderColor: `rgba(${54 + index * 50}, ${162 + index * 30}, ${235}, 1)`,
      borderWidth: 2,
    }))
  };

  // 4. Monthly review trends
  const monthlyData = {};
  Object.values(reviewerStats).forEach(stat => {
    Object.entries(stat.monthlyStats).forEach(([month, data]) => {
      if (!monthlyData[month]) monthlyData[month] = { reviewed: 0, approved: 0 };
      monthlyData[month].reviewed += data.reviewed;
      monthlyData[month].approved += data.approved;
    });
  });
  
  const sortedMonths = Object.keys(monthlyData).sort();
  const monthlyChartData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Items Reviewed',
        data: sortedMonths.map(month => monthlyData[month].reviewed),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Items Approved',
        data: sortedMonths.map(month => monthlyData[month].approved),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
      }
    ]
  };

  /* ===============================
     HANDLERS
  =============================== */
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // In a real app, you would filter data based on time range
  };

  const handleReviewerSelect = (reviewerId) => {
    setSelectedReviewer(reviewerId);
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-12">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Reviewer Dashboard
                  </h3>
                  <div className="card-tools">
                    <div className="btn-group">
                      <button 
                        type="button" 
                        className="btn btn-tool dropdown-toggle" 
                        data-toggle="dropdown"
                        title="Time Range"
                      >
                        <i className="fas fa-calendar-alt"></i> {timeRange.toUpperCase()}
                      </button>
                      <div className="dropdown-menu dropdown-menu-right" role="menu">
                        <button className="dropdown-item" onClick={() => handleTimeRangeChange("week")}>This Week</button>
                        <button className="dropdown-item" onClick={() => handleTimeRangeChange("month")}>This Month</button>
                        <button className="dropdown-item" onClick={() => handleTimeRangeChange("quarter")}>This Quarter</button>
                        <button className="dropdown-item" onClick={() => handleTimeRangeChange("year")}>This Year</button>
                      </div>
                    </div>
                    <button 
                      className="btn btn-tool" 
                      title="Refresh"
                      onClick={() => window.location.reload()}
                    >
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= KPI ROW ================= */}
          <div className="row">
            <div className="col-lg-3 col-md-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{totalReviewers}</h3>
                  <p>Active Reviewers</p>
                </div>
                <div className="icon">
                  <i className="fas fa-user-check"></i>
                </div>
                <a href="#" className="small-box-footer">
                  View All <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{totalItemsReviewed}</h3>
                  <p>Total Reviews Completed</p>
                  <div className="small">{overallApprovalRate}% approval rate</div>
                </div>
                <div className="icon">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <a href="#" className="small-box-footer">
                  View Details <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{pendingReviews}</h3>
                  <p>Pending Reviews</p>
                  <div className="small">Awaiting reviewer action</div>
                </div>
                <div className="icon">
                  <i className="fas fa-clock"></i>
                </div>
                <a href="#" className="small-box-footer">
                  Review Now <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="small-box bg-purple">
                <div className="inner">
                  <h3>{overallAvgReviewTime}d</h3>
                  <p>Avg Review Time</p>
                  <div className="small">From submission to decision</div>
                </div>
                <div className="icon">
                  <i className="fas fa-stopwatch"></i>
                </div>
                <a href="#" className="small-box-footer">
                  Performance <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          <div className="row">
            {/* Left Column: Charts */}
            <div className="col-lg-8">
              {/* Workload Distribution Chart */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-chart-bar mr-2"></i>
                    Reviewer Workload Distribution
                  </h3>
                  <div className="card-tools">
                    <select 
                      className="form-control form-control-sm" 
                      style={{width: 'auto'}}
                      value={selectedReviewer}
                      onChange={(e) => handleReviewerSelect(e.target.value)}
                    >
                      <option value="all">All Reviewers</option>
                      {Object.entries(reviewerStats).map(([id, stat]) => (
                        <option key={id} value={id}>{stat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Loading chart data...
                    </div>
                  ) : (
                    <Bar 
                      data={workloadChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Items'
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="card mt-3">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-chart-line mr-2"></i>
                    Monthly Review Trends
                  </h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Loading trend data...
                    </div>
                  ) : (
                    <Line 
                      data={monthlyChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Items'
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Stats and Metrics */}
            <div className="col-lg-4">
              {/* Performance Overview */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-chart-pie mr-2"></i>
                    Review Outcomes
                  </h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Loading outcomes...
                    </div>
                  ) : (
                    <Doughnut 
                      data={outcomesChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                        },
                      }}
                    />
                  )}
                </div>
                <div className="card-footer">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="text-success">
                        <strong>{totalApproved}</strong>
                        <div className="small">Approved</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-danger">
                        <strong>{totalRejected}</strong>
                        <div className="small">Rejected</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-warning">
                        <strong>{totalReturned}</strong>
                        <div className="small">Returned</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="card mt-3">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-star mr-2"></i>
                    Performance Metrics
                  </h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Loading metrics...
                    </div>
                  ) : (
                    <PolarArea 
                      data={performanceChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                        },
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 100
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Top Performers */}
              <div className="card mt-3">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-trophy mr-2"></i>
                    Top Performers
                  </h3>
                </div>
                <div className="card-body p-0">
                  <ul className="products-list product-list-in-card pl-2 pr-2">
                    {Object.values(reviewerStats)
                      .sort((a, b) => parseFloat(b.overallScore) - parseFloat(a.overallScore))
                      .slice(0, 3)
                      .map((reviewer, index) => (
                        <li className="item" key={reviewer.id}>
                          <div className="product-info">
                            <span className="product-title">
                              {reviewer.name}
                              <span className={`badge float-right ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-info'}`}>
                                #{index + 1}
                              </span>
                            </span>
                            <span className="product-description">
                              <div className="progress" style={{height: '10px'}}>
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{width: `${reviewer.overallScore}%`}}
                                ></div>
                              </div>
                              <div className="row mt-1">
                                <div className="col-6">
                                  <small className="text-muted">
                                    <i className="fas fa-check-circle text-success mr-1"></i>
                                    {reviewer.approvalRate}% approved
                                  </small>
                                </div>
                                <div className="col-6 text-right">
                                  <small className="text-muted">
                                    <i className="fas fa-clock text-info mr-1"></i>
                                    {reviewer.avgReviewTime}d avg
                                  </small>
                                </div>
                              </div>
                            </span>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ================= REVIEWER DETAILS TABLE ================= */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-table mr-2"></i>
                    Reviewer Performance Details
                  </h3>
                  <div className="card-tools">
                    <button className="btn btn-tool" data-card-widget="collapse">
                      <i className="fas fa-minus"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body table-responsive p-0">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Reviewer</th>
                        <th>Total Reviewed</th>
                        <th>Pending</th>
                        <th>Approval Rate</th>
                        <th>Avg Review Time</th>
                        <th>Quality Score</th>
                        <th>Efficiency</th>
                        <th>Overall Score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(reviewerStats)
                        .sort((a, b) => parseFloat(b.overallScore) - parseFloat(a.overallScore))
                        .map((reviewer) => (
                          <tr key={reviewer.id}>
                            <td>
                              <div className="user-block">
                                <span className="username">
                                  <a href="#">{reviewer.name}</a>
                                </span>
                                <span className="description">{reviewer.email}</span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-primary">{reviewer.totalReviewed}</span>
                            </td>
                            <td>
                              <span className="badge bg-warning">{reviewer.pendingReviews}</span>
                            </td>
                            <td>
                              <div className="progress-group">
                                <div className="progress progress-sm">
                                  <div 
                                    className={`progress-bar ${parseFloat(reviewer.approvalRate) >= 80 ? 'bg-success' : parseFloat(reviewer.approvalRate) >= 60 ? 'bg-warning' : 'bg-danger'}`}
                                    style={{width: `${reviewer.approvalRate}%`}}
                                  ></div>
                                </div>
                                <span className="progress-number">
                                  <strong>{reviewer.approvalRate}%</strong>
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={parseFloat(reviewer.avgReviewTime) < parseFloat(overallAvgReviewTime) ? "text-success" : "text-danger"}>
                                <strong>{reviewer.avgReviewTime}d</strong>
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${reviewer.qualityScore >= 80 ? 'bg-success' : reviewer.qualityScore >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                                {reviewer.qualityScore}/100
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${reviewer.efficiencyScore >= 80 ? 'bg-success' : reviewer.efficiencyScore >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                                {reviewer.efficiencyScore}/100
                              </span>
                            </td>
                            <td>
                              <div className="progress" style={{height: '20px'}}>
                                <div 
                                  className={`progress-bar ${reviewer.overallScore >= 80 ? 'bg-success' : reviewer.overallScore >= 60 ? 'bg-warning' : 'bg-danger'}`}
                                  style={{width: `${reviewer.overallScore}%`}}
                                >
                                  {reviewer.overallScore}/100
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${reviewer.overallScore >= 80 ? 'bg-success' : reviewer.overallScore >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                                {reviewer.overallScore >= 80 ? 'Excellent' : reviewer.overallScore >= 60 ? 'Good' : 'Needs Review'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ================= QUICK ACTIONS ================= */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card card-primary card-outline">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-bolt mr-2"></i>
                    Quick Actions
                  </h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 col-sm-6">
                      <a href="/repository/reviewer/assign" className="btn btn-app bg-info">
                        <i className="fas fa-user-plus"></i> Assign Reviewer
                      </a>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <a href="/repository/items/pending" className="btn btn-app bg-warning">
                        <i className="fas fa-clock"></i> Pending Reviews
                      </a>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <a href="/repository/reports/review-performance" className="btn btn-app bg-success">
                        <i className="fas fa-chart-bar"></i> Detailed Reports
                      </a>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <a href="/repository/reviewer/settings" className="btn btn-app bg-purple">
                        <i className="fas fa-cog"></i> Settings
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}