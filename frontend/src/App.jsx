import { useEffect, useState } from "react";
import "./App.css";
import AnalyzeProject from "./components/AnalyzeProject";
import History from "./components/History";

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
        <header className="topbar">
          <div></div>

          <button
            className="primary-button"
            onClick={() => setCurrentPage("analyze")}
          >
            Analyze New Project
          </button>
        </header>

        {dashboardError && (
          <div className="error-message">
            {dashboardError}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Projects</span>

            <strong>
              {dashboardLoading
                ? "..."
                : dashboardStats.total_projects}
            </strong>

            <p>Projects analyzed</p>
          </div>

          <div className="stat-card">
            <span>High Risk</span>

            <strong>
              {dashboardLoading
                ? "..."
                : dashboardStats.high_risk}
            </strong>

            <p>Projects requiring attention</p>
          </div>

          <div className="stat-card">
            <span>Critical Risk</span>

            <strong>
              {dashboardLoading
                ? "..."
                : dashboardStats.critical_risk}
            </strong>

            <p>Immediate action required</p>
          </div>

          <div className="stat-card">
            <span>AI Analyses</span>

            <strong>
              {dashboardLoading
                ? "..."
                : dashboardStats.ai_analyses}
            </strong>

            <p>Gemini project reports</p>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel large-panel">
            <div className="panel-header">
              <h3>Recent Project Analysis</h3>
            </div>

            {dashboardLoading ? (
              <div className="empty-state">
                <p>Loading recent analyses...</p>
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">◎</div>

                <h4>No projects analyzed yet</h4>

                <p>
                  Start by submitting your first project to the
                  AI risk model and Gemini analysis engine.
                </p>

                <button
                  className="secondary-button"
                  onClick={() =>
                    setCurrentPage("analyze")
                  }
                >
                  Analyze First Project
                </button>
              </div>
            ) : (
              <div className="recent-analysis-list">
                {recentAnalyses.map((analysis) => {
                  const riskLevel =
                    analysis.risk_prediction
                      ?.risk_level || "Unknown";

                  const confidence =
                    analysis.risk_prediction
                      ?.confidence;

                  return (
                    <div
                      className="recent-analysis-item"
                      key={analysis.id}
                    >
                      <div>
                        <strong>
                          {riskLevel} Risk
                        </strong>

                        <p>
                          {analysis.project_analysis
                            ?.executive_summary ||
                            "Project analysis"}
                        </p>

                        {typeof confidence ===
                          "number" && (
                          <small>
                            Confidence:{" "}
                            {(
                              confidence * 100
                            ).toFixed(1)}
                            %
                          </small>
                        )}
                      </div>

                      <span
                        className={`recent-risk-badge risk-${riskLevel.toLowerCase()}`}
                      >
                        {riskLevel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel">
            <h3>AI Engine Status</h3>

            <div className="status-row">
              <div>
                <strong>
                  Risk Prediction Model
                </strong>
                <p>Vertex AI V3</p>
              </div>

              <span className="status-badge">
                Online
              </span>
            </div>

            <div className="status-row">
              <div>
                <strong>
                  Project Analysis
                </strong>
                <p>Gemini 2.5 Flash</p>
              </div>

              <span className="status-badge">
                Online
              </span>
            </div>

            <div className="status-row">
              <div>
                <strong>
                  Backend API
                </strong>
                <p>Google Cloud Run</p>
              </div>

              <span className="status-badge">
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