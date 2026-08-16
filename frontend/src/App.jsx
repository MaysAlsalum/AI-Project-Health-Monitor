import { useEffect, useState } from "react";
import "./App.css";
import AnalyzeProject from "./components/AnalyzeProject";
import History from "./components/History";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const API_URL = "https://project-health-backend-726081684022.us-central1.run.app";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [dashboardStats, setDashboardStats] = useState({
    total_projects: 0,
    high_risk: 0,
    critical_risk: 0,
    ai_analyses: 0,
  });

  const [recentAnalyses, setRecentAnalyses] = useState([]);

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const riskDistribution = [
      {
        name: "Low",
        value: recentAnalyses.filter(
          (item) => item.risk_prediction?.risk_level === "Low"
        ).length,
      },
      {
        name: "Medium",
        value: recentAnalyses.filter(
          (item) => item.risk_prediction?.risk_level === "Medium"
        ).length,
      },
      {
        name: "High",
        value: recentAnalyses.filter(
          (item) => item.risk_prediction?.risk_level === "High"
        ).length,
      },
      {
        name: "Critical",
        value: recentAnalyses.filter(
          (item) => item.risk_prediction?.risk_level === "Critical"
        ).length,
      },
    ];

    const RISK_COLORS = [
      "#2f9e6f",
      "#e0a11b",
      "#ed6c2f",
      "#d9363e",
    ];

    const confidenceValues = recentAnalyses
      .map((item) => item.risk_prediction?.confidence)
      .filter((value) => typeof value === "number");

    const averageConfidence =
      confidenceValues.length > 0
        ? (
            (confidenceValues.reduce((sum, value) => sum + value, 0) /
              confidenceValues.length) *
            100
          ).toFixed(1)
        : "0.0";

    const riskTrendData = [...recentAnalyses]
      .reverse()
      .map((item, index) => ({
        analysis: index + 1,
        confidence: Number(
          ((item.risk_prediction?.confidence || 0) * 100).toFixed(1)
        ),
      }));

  useEffect(() => {
    if (currentPage !== "dashboard") {
      return;
    }

    async function loadDashboard() {
      setDashboardLoading(true);
      setDashboardError("");

      try {
        const [statsResponse, recentResponse] = await Promise.all([
          fetch(`${API_URL}/dashboard`),
          fetch(`${API_URL}/analyses/recent`),
        ]);

        if (!statsResponse.ok) {
          throw new Error("Failed to load dashboard statistics.");
        }

        if (!recentResponse.ok) {
          throw new Error("Failed to load recent analyses.");
        }

        const statsData = await statsResponse.json();
        const recentData = await recentResponse.json();

        setDashboardStats(statsData);
        setRecentAnalyses(recentData.analyses || []);
      } catch (error) {
        console.error("Dashboard error:", error);
        setDashboardError(error.message);
      } finally {
        setDashboardLoading(false);
      }
    }

    loadDashboard();
  }, [currentPage]);

  if (currentPage === "analyze") {
    return (
      <AnalyzeProject
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }


  if (currentPage === "history") {
    return (
      <History
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h2>AI Project Health Monitor</h2>

          <p className="sidebar-subtitle">
            Project Intelligence Dashboard
          </p>
        </div>

        <nav>
          <button
            className="nav-item active"
            onClick={() => setCurrentPage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => setCurrentPage("analyze")}
          >
            Analyze Project
          </button>

          <button
            className="nav-item"
            onClick={() => setCurrentPage("history")}
          >
            History
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {dashboardError && (
          <div className="error-message">
            {dashboardError}
          </div>
        )}

        
        <section className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">PROJECT INTELLIGENCE</span>
            <h1>Dashboard</h1>
            <p>
              Monitor projects health.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setCurrentPage("analyze")}
          >
            + Analyze New Project
          </button>
        </section>

        <section className="dashboard-kpis">
          <div className="kpi-card">
            <div className="kpi-top">
              <span>Total Projects</span>
              <span className="kpi-icon">▣</span>
            </div>

            <strong>{dashboardStats.total_projects}</strong>
            <p>Projects analyzed</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span>High Risk</span>
              <span className="kpi-icon warning">▲</span>
            </div>

            <strong>{dashboardStats.high_risk}</strong>
            <p>Projects requiring attention</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span>Critical Risk</span>
              <span className="kpi-icon critical">!</span>
            </div>

            <strong>{dashboardStats.critical_risk}</strong>
            <p>Immediate action required</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span>Average Confidence</span>
              <span className="kpi-icon confidence">✓</span>
            </div>

            <strong>{averageConfidence}%</strong>
            <p>Across recent predictions</p>
          </div>
        </section>

        <section className="dashboard-visual-grid">
          {/* Risk Distribution */}
          <div className="dashboard-panel risk-distribution-panel">
            <div className="dashboard-panel-title">
              <div>
                <h3>Risk Distribution</h3>
              </div>
            </div>

            <div className="risk-distribution-content">
              <div className="risk-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="100%"
                      paddingAngle={2}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={RISK_COLORS[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="chart-center-label">
                  <strong>{dashboardStats.total_projects}</strong>
                  <span>Projects</span>
                </div>
              </div>

              <div className="risk-legend">
                {riskDistribution.map((item, index) => (
                  <div className="risk-legend-item" key={item.name}>
                    <div>
                      <span
                        className="legend-dot"
                        style={{ backgroundColor: RISK_COLORS[index] }}
                      ></span>

                      <span>{item.name}</span>
                    </div>

                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Analysis */}
          <div className="dashboard-panel recent-panel">
            <div className="dashboard-panel-title">
              <div>
                <h3>Recent Analyses</h3>
                <p>Latest AI project assessments</p>
              </div>

              <button
                className="text-button"
                onClick={() => setCurrentPage("history")}
              >
                View All
              </button>
            </div>

            <div className="recent-dashboard-list">
              {recentAnalyses.length === 0 ? (
                <div className="dashboard-empty">
                  No projects analyzed yet.
                </div>
              ) : (
                recentAnalyses.slice(0, 5).map((analysis) => {
                  const risk =
                    analysis.risk_prediction?.risk_level || "Unknown";

                  const confidence =
                    analysis.risk_prediction?.confidence || 0;

                  return (
                    <div
                      className="recent-dashboard-row"
                      key={analysis.id}
                    >
                      <div className="recent-project-info">
                        <strong>
                          {analysis.project_name ||
                            analysis.project_data?.Project_Name ||
                            "Project Analysis"}
                        </strong>

                        <span>
                          {analysis.project_data?.Project_Type || "Project"}
                        </span>
                      </div>

                      <span
                        className={`recent-risk-badge risk-${risk.toLowerCase()}`}
                      >
                        {risk}
                      </span>

                      <strong className="recent-confidence">
                        {(confidence * 100).toFixed(1)}%
                      </strong>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Risk Trend */}
          <div className="dashboard-panel trend-panel">
            <div className="dashboard-panel-title">
              <div>
                <h3>Prediction Confidence Trend</h3>
                <p>Recent AI prediction confidence</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="analysis"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#157f5b"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Infrastructure */}
          <div className="dashboard-panel ai-status-panel">
            <div className="dashboard-panel-title">
              <div>
                <h3>AI Infrastructure</h3>
                <p>Google Cloud services</p>
              </div>
            </div>

            <div className="ai-service-row">
              <div className="ai-service-icon">AI</div>

              <div className="ai-service-info">
                <strong>Risk Prediction Model</strong>
                <span>Vertex AI V3</span>
              </div>

              <span className="service-online">
                <i></i>
                Online
              </span>
            </div>

            <div className="ai-service-row">
              <div className="ai-service-icon">✦</div>

              <div className="ai-service-info">
                <strong>Project Analysis</strong>
                <span>Gemini 2.5 Flash</span>
              </div>

              <span className="service-online">
                <i></i>
                Online
              </span>
            </div>

            <div className="ai-service-row">
              <div className="ai-service-icon">API</div>

              <div className="ai-service-info">
                <strong>Backend API</strong>
                <span>Google Cloud Run</span>
              </div>

              <span className="service-online">
                <i></i>
                Online
              </span>
            </div>

            <div className="ai-service-row">
              <div className="ai-service-icon">DB</div>

              <div className="ai-service-info">
                <strong>Project Database</strong>
                <span>Cloud Firestore</span>
              </div>

              <span className="service-online">
                <i></i>
                Online
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;