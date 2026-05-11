import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { getItems } from "../../../api/repository.api";
import { getUsers } from "../../../api/user.api"; // Assuming you have a users API
import Swal from "sweetalert2";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function CuratorPerformanceReport() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [curatorStats, setCuratorStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both items and users data
        const [itemsRes, usersRes] = await Promise.all([
          getItems(),
          getUsers() // Fetch users from your users table
        ]);
        
        // Filter for processed/approved items only
        const processedItems = itemsRes.data.filter(
          (item) => item.status === "processed" || item.status === "approved"
        );
        
        setItems(processedItems);
        setUsers(usersRes.data);
        
        // Calculate curator statistics with user mapping
        const stats = calculateCuratorStats(processedItems, usersRes.data);
        setCuratorStats(stats);
        
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to load curator performance data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===============================
     CALCULATE CURATOR STATISTICS WITH USER MAPPING
  =============================== */
  const calculateCuratorStats = (items, users) => {
    const stats = {};
    
    // Create a mapping of user IDs to user details for easy lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
      // Also map by username/email if needed
      if (user.username) userMap[user.username] = user;
      if (user.email) userMap[user.email] = user;
    });
    
    items.forEach((item) => {
      // Get curator ID from item - this could be: created_by, curator_id, processed_by, etc.
      // Adjust the field name based on your data structure
      const curatorId = item.curator_id || item.processed_by || item.created_by;
      
      // Find user details from users table
      let curator = "Unknown";
      let curatorDetails = null;
      
      if (curatorId && userMap[curatorId]) {
        curatorDetails = userMap[curatorId];
        curator = curatorDetails.name || curatorDetails.username || curatorDetails.email || `User ${curatorId}`;
      } else {
        // Fallback to raw curator field if no user mapping found
        curator = item.curator || item.processed_by || "Unknown";
      }
      
      if (!stats[curator]) {
        stats[curator] = {
          curatorId: curatorId,
          curatorDetails: curatorDetails,
          count: 0,
          totalProcessingTime: 0,
          processingTimes: [],
          statusCount: {
            processed: 0,
            approved: 0,
          },
          items: [] // Store item references if needed
        };
      }
      
      // Calculate processing time (created_at to updated_at)
      const submitted = new Date(item.created_at);
      const updated = new Date(item.updated_at);
      const days = Math.max((updated - submitted) / (1000 * 60 * 60 * 24), 0);
      
      stats[curator].count++;
      stats[curator].totalProcessingTime += days;
      stats[curator].processingTimes.push(days);
      stats[curator].items.push(item);
      
      // Track status
      if (item.status === "processed") {
        stats[curator].statusCount.processed++;
      } else if (item.status === "approved") {
        stats[curator].statusCount.approved++;
      }
    });
    
    // Calculate averages and additional metrics
    Object.keys(stats).forEach(curator => {
      const stat = stats[curator];
      stat.averageTime = stat.count > 0 ? (stat.totalProcessingTime / stat.count).toFixed(2) : 0;
      stat.minTime = stat.count > 0 ? Math.min(...stat.processingTimes).toFixed(2) : 0;
      stat.maxTime = stat.count > 0 ? Math.max(...stat.processingTimes).toFixed(2) : 0;
      stat.approvalRate = stat.count > 0 ? 
        ((stat.statusCount.approved / stat.count) * 100).toFixed(1) : 0;
      
      // Calculate efficiency score (weighted combination of speed and quality)
      const speedScore = stat.count > 0 ? Math.max(0, 100 - (parseFloat(stat.averageTime) * 10)) : 0;
      const qualityScore = parseFloat(stat.approvalRate);
      stat.efficiencyScore = ((speedScore * 0.4) + (qualityScore * 0.6)).toFixed(1);
    });
    
    return stats;
  };

  /* ===============================
     KPI VALUES
  =============================== */
  const totalCurators = Object.keys(curatorStats).length;
  const totalItems = items.length;
  
  // Calculate overall metrics
  const overallAvgTime = totalCurators > 0 
    ? (Object.values(curatorStats).reduce((sum, stat) => sum + parseFloat(stat.averageTime), 0) / totalCurators).toFixed(2)
    : 0;
  
  const overallApprovalRate = totalItems > 0
    ? ((items.filter(item => item.status === "approved").length / totalItems) * 100).toFixed(1)
    : 0;
  
  // Find best performing curator (based on efficiency score)
  const bestPerformer = Object.entries(curatorStats)
    .filter(([_, stat]) => stat.count >= 5)
    .sort((a, b) => parseFloat(b[1].efficiencyScore) - parseFloat(a[1].efficiencyScore))[0] || null;
  
  // Fastest curator (lowest average time)
  const fastestCurator = Object.entries(curatorStats)
    .filter(([_, stat]) => stat.count >= 5)
    .sort((a, b) => parseFloat(a[1].averageTime) - parseFloat(b[1].averageTime))[0] || null;
  
  // Highest approval rate curator
  const highestApprovalRate = Object.entries(curatorStats)
    .filter(([_, stat]) => stat.count >= 5)
    .sort((a, b) => parseFloat(b[1].approvalRate) - parseFloat(a[1].approvalRate))[0] || null;

  /* ===============================
     CHART DATA PREPARATION
  =============================== */
  
  // 1. Items per curator (bar chart)
  const curatorLabels = Object.keys(curatorStats);
  const itemsPerCurator = curatorLabels.map(curator => curatorStats[curator].count);
  
  const itemsChartData = {
    labels: curatorLabels,
    datasets: [
      {
        label: 'Items Processed',
        data: itemsPerCurator,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ]
  };

  // 2. Average processing time per curator
  const avgTimePerCurator = curatorLabels.map(curator => parseFloat(curatorStats[curator].averageTime));
  
  const timeChartData = {
    labels: curatorLabels,
    datasets: [
      {
        label: 'Avg Processing Time (Days)',
        data: avgTimePerCurator,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ]
  };

  // 3. Efficiency score radar chart data (if you want to add radar chart)
  const efficiencyScores = curatorLabels.map(curator => parseFloat(curatorStats[curator].efficiencyScore));
  
  const efficiencyChartData = {
    labels: curatorLabels,
    datasets: [
      {
        label: 'Efficiency Score',
        data: efficiencyScores,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      }
    ]
  };

  // 4. Approval rates (doughnut chart)
  const approvalRates = curatorLabels.map(curator => parseFloat(curatorStats[curator].approvalRate));
  const approvalRateColors = approvalRates.map(rate => {
    if (rate >= 90) return 'rgba(75, 192, 192, 0.7)';
    if (rate >= 70) return 'rgba(255, 206, 86, 0.7)';
    return 'rgba(255, 99, 132, 0.7)';
  });

  const approvalChartData = {
    labels: curatorLabels,
    datasets: [
      {
        label: 'Approval Rate (%)',
        data: approvalRates,
        backgroundColor: approvalRateColors,
        borderColor: approvalRateColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1,
      }
    ]
  };

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-chart-line mr-2"></i>
                Curator Performance Report
              </h3>
              <div className="card-tools">
                <button 
                  className="btn btn-tool" 
                  title="Refresh"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Loading curator performance data...
                </div>
              ) : (
                <>
                  {/* ================= KPI ROW ================= */}
                  <div className="row mb-4">
                    <div className="col-lg-3 col-md-6">
                      <div className="small-box bg-info">
                        <div className="inner">
                          <h3>{totalCurators}</h3>
                          <p>Active Curators</p>
                          <div className="small">
                            From {users.length} total users
                          </div>
                        </div>
                        <div className="icon">
                          <i className="fas fa-users"></i>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                      <div className="small-box bg-success">
                        <div className="inner">
                          <h3>{totalItems}</h3>
                          <p>Total Items Processed</p>
                          <div className="small">
                            {overallApprovalRate}% overall approval rate
                          </div>
                        </div>
                        <div className="icon">
                          <i className="fas fa-tasks"></i>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                      <div className="small-box bg-warning">
                        <div className="inner">
                          <h3>{overallAvgTime}</h3>
                          <p>Avg Processing Time</p>
                          <small>Days per item across all curators</small>
                        </div>
                        <div className="icon">
                          <i className="fas fa-clock"></i>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                      <div className="small-box bg-purple">
                        <div className="inner">
                          <h3>
                            {bestPerformer 
                              ? bestPerformer[0].substring(0, 12) + (bestPerformer[0].length > 12 ? '...' : '')
                              : 'N/A'
                            }
                          </h3>
                          <p>Top Performer</p>
                          <small>
                            {bestPerformer ? `${bestPerformer[1].efficiencyScore}/100 score` : 'Insufficient data'}
                          </small>
                        </div>
                        <div className="icon">
                          <i className="fas fa-trophy"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================= DETAILED STATS TABLE ================= */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-table mr-2"></i>
                            Curator Performance Details
                          </h3>
                          <div className="card-tools">
                            <span className="badge bg-info">
                              {users.length} Users in System
                            </span>
                          </div>
                        </div>
                        <div className="card-body table-responsive p-0">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Curator</th>
                                <th>User Details</th>
                                <th>Items</th>
                                <th>Avg Time</th>
                                <th>Min/Max</th>
                                <th>Approval Rate</th>
                                <th>Efficiency</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(curatorStats)
                                .sort((a, b) => parseFloat(b[1].efficiencyScore) - parseFloat(a[1].efficiencyScore))
                                .map(([curatorName, stat]) => {
                                  const userDetails = stat.curatorDetails;
                                  return (
                                    <tr key={curatorName}>
                                      <td>
                                        <strong>{curatorName}</strong>
                                        {userDetails && (
                                          <div className="small text-muted">
                                            ID: {stat.curatorId}
                                          </div>
                                        )}
                                      </td>
                                      <td>
                                        {userDetails ? (
                                          <>
                                            <div>{userDetails.email || 'No email'}</div>
                                            <div className="small text-muted">
                                              {userDetails.role || 'No role specified'}
                                            </div>
                                          </>
                                        ) : (
                                          <span className="text-muted">No user details</span>
                                        )}
                                      </td>
                                      <td>
                                        <span className="badge bg-primary" title="Total items processed">
                                          {stat.count}
                                        </span>
                                      </td>
                                      <td>
                                        <div className={parseFloat(stat.averageTime) < parseFloat(overallAvgTime) ? "text-success" : "text-danger"}>
                                          <strong>{stat.averageTime}d</strong>
                                        </div>
                                        <div className="small text-muted">
                                          vs avg: {overallAvgTime}d
                                        </div>
                                      </td>
                                      <td>
                                        <div>{stat.minTime}d / {stat.maxTime}d</div>
                                        <div className="small text-muted">
                                          Range
                                        </div>
                                      </td>
                                      <td>
                                        <span className={`badge ${parseFloat(stat.approvalRate) >= 90 ? 'bg-success' : parseFloat(stat.approvalRate) >= 70 ? 'bg-warning' : 'bg-danger'}`}>
                                          {stat.approvalRate}%
                                        </span>
                                        <div className="small text-muted">
                                          {stat.statusCount.approved} approved
                                        </div>
                                      </td>
                                      <td>
                                        <div className="progress" style={{ height: '20px' }}>
                                          <div 
                                            className={`progress-bar ${parseFloat(stat.efficiencyScore) >= 80 ? 'bg-success' : parseFloat(stat.efficiencyScore) >= 60 ? 'bg-warning' : 'bg-danger'}`}
                                            role="progressbar"
                                            style={{ width: `${stat.efficiencyScore}%` }}
                                            aria-valuenow={stat.efficiencyScore}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                          >
                                            {stat.efficiencyScore}/100
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        <span className={`badge ${parseFloat(stat.efficiencyScore) >= 80 ? 'bg-success' : parseFloat(stat.efficiencyScore) >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                                          {parseFloat(stat.efficiencyScore) >= 80 ? 'Excellent' : 
                                           parseFloat(stat.efficiencyScore) >= 60 ? 'Good' : 'Needs Improvement'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================= CHARTS ROW 1 ================= */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-chart-bar mr-2"></i>
                            Items Processed per Curator
                          </h3>
                          <small className="text-muted">
                            Workload distribution among curators
                          </small>
                        </div>
                        <div className="card-body">
                          <Bar 
                            data={itemsChartData}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  position: 'top',
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      return `${context.dataset.label}: ${context.raw} items`;
                                    }
                                  }
                                }
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
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-chart-line mr-2"></i>
                            Average Processing Time
                          </h3>
                          <small className="text-muted">
                            Days from creation to update (Lower is better)
                          </small>
                        </div>
                        <div className="card-body">
                          <Bar 
                            data={timeChartData}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  position: 'top',
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      return `${context.dataset.label}: ${context.raw} days`;
                                    }
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  title: {
                                    display: true,
                                    text: 'Days'
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================= CHARTS ROW 2 ================= */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-chart-pie mr-2"></i>
                            Approval Rates per Curator
                          </h3>
                          <small className="text-muted">
                            Quality metrics by curator
                          </small>
                        </div>
                        <div className="card-body">
                          <Doughnut 
                            data={approvalChartData}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  position: 'right',
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      return `${context.label}: ${context.raw}%`;
                                    }
                                  }
                                }
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title">
                            <i className="fas fa-chart-area mr-2"></i>
                            Performance Insights
                          </h3>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-12">
                              <h5>Top Performers:</h5>
                              <div className="row">
                                {bestPerformer && (
                                  <div className="col-md-6">
                                    <div className="info-box bg-gradient-success">
                                      <span className="info-box-icon">
                                        <i className="fas fa-trophy"></i>
                                      </span>
                                      <div className="info-box-content">
                                        <span className="info-box-text">Top Performer</span>
                                        <span className="info-box-number">{bestPerformer[0]}</span>
                                        <div className="progress">
                                          <div className="progress-bar" style={{width: `${bestPerformer[1].efficiencyScore}%`}}></div>
                                        </div>
                                        <span className="progress-description">
                                          Score: {bestPerformer[1].efficiencyScore}/100
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {fastestCurator && fastestCurator[0] !== bestPerformer?.[0] && (
                                  <div className="col-md-6">
                                    <div className="info-box bg-gradient-info">
                                      <span className="info-box-icon">
                                        <i className="fas fa-bolt"></i>
                                      </span>
                                      <div className="info-box-content">
                                        <span className="info-box-text">Fastest Curator</span>
                                        <span className="info-box-number">{fastestCurator[0]}</span>
                                        <div className="progress">
                                          <div className="progress-bar" style={{width: `${100 - (parseFloat(fastestCurator[1].averageTime) * 5)}%`}}></div>
                                        </div>
                                        <span className="progress-description">
                                          Avg time: {fastestCurator[1].averageTime} days
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <h5 className="mt-3">Recommendations:</h5>
                              <ul>
                                <li>
                                  <strong>Workload Balancing:</strong> Consider redistributing items to balance curator workloads
                                </li>
                                <li>
                                  <strong>Training Opportunities:</strong> Curators with approval rates below 70% may benefit from additional training
                                </li>
                                <li>
                                  <strong>Process Optimization:</strong> Review workflows for curators with processing times above {overallAvgTime} days
                                </li>
                              </ul>
                            </div>
                          </div>
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