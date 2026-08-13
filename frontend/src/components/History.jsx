import { useEffect, useState } from "react";

const API_URL = "https://project-health-backend-726081684022.us-central1.run.app";

function History({ onBack }) {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/analyses`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load project history."
          );
        }

        setAnalyses(data.analyses || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  function formatDate(dateString) {
    if (!dateString) return "Unknown";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getProjectName(analysis) {
    if (analysis.project_name) {
      return analysis.project_name;
    }

    const summary =
      analysis.project_analysis?.executive_summary || "";

    if (
      summary
        .toLowerCase()
        .includes("enterprise reporting modernization")
    ) {
      return "Enterprise Reporting Modernization";
    }

    if (
      summary
        .toLowerCase()
        .includes("customer self-service portal")
    ) {
      return "Customer Self-Service Portal";
    }

    if (
      summary
        .toLowerCase()
        .includes("crm migration")
    ) {
      return "CRM Migration Project";
    }

    return "Unnamed Project";
  }

  if (loading) {
    return (
      <div className="history-page">
        <p>Loading project history...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <header className="history-header">
          <span>PROJECT RECORDS</span>
          <h1>Analysis History</h1>
          <p>
            Review previous project risk assessments and AI analyses.
          </p>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* =========================
            Selected Analysis
        ========================== */}

        {selectedAnalysis && (
          <section className="selected-history-analysis">

            <div className="selected-history-header">
              <div>
                <span className="history-label">
                  SELECTED PROJECT
                </span>

                <h2>
                  {getProjectName(selectedAnalysis)}
                </h2>

                <p>
                  Analysis ID: {selectedAnalysis.id}
                </p>
              </div>

              <span
                className={`history-risk-badge risk-${selectedAnalysis.risk_prediction?.risk_level?.toLowerCase()}`}
              >
                {selectedAnalysis.risk_prediction?.risk_level} Risk
              </span>
            </div>

            <div className="selected-history-stats">

              <div>
                <span>Risk Level</span>
                <strong>
                  {selectedAnalysis.risk_prediction?.risk_level}
                </strong>
              </div>

              <div>
                <span>Confidence</span>
                <strong>
                  {(
                    (selectedAnalysis.risk_prediction?.confidence || 0) *
                    100
                  ).toFixed(1)}
                  %
                </strong>
              </div>

              <div>
                <span>Project Type</span>
                <strong>
                  {selectedAnalysis.project_data?.Project_Type}
                </strong>
              </div>

              <div>
                <span>Analysis Date</span>
                <strong>
                  {formatDate(selectedAnalysis.created_at)}
                </strong>
              </div>

            </div>

            <div className="selected-history-summary">
              <h3>Executive Summary</h3>

              <p>
                {
                  selectedAnalysis.project_analysis
                    ?.executive_summary
                }
              </p>
            </div>

            <button
              className="close-analysis-button"
              onClick={() => setSelectedAnalysis(null)}
            >
              Close Details
            </button>

          </section>
        )}

        {/* =========================
            Project List
        ========================== */}

        <section className="history-table-card">

          <div className="history-table-title">
            <div>
                <div className="project-analyses-header">
                    <h2>Project Analyses</h2>

                    <div className="assessments-badge">
                        <span className="assessments-count">{analyses.length}</span>
                        <span>Saved Assessments</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="history-table">

            <div className="history-table-head">
              <span>Project</span>
              <span>Analysis ID</span>
              <span>Risk</span>
              <span>Confidence</span>
              <span>Date</span>
            </div>

            {analyses.map((analysis) => {
              const riskLevel =
                analysis.risk_prediction?.risk_level ||
                "Unknown";

              const confidence =
                analysis.risk_prediction?.confidence || 0;

              return (
                <button
                  key={analysis.id}
                  className="history-table-row"
                  onClick={() => {
                    setSelectedAnalysis(analysis);

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                >
                  <div className="history-project-name">
                    <strong>
                      {getProjectName(analysis)}
                    </strong>

                    <span>
                      {analysis.project_data?.Project_Type}
                      {" · "}
                      {analysis.project_data?.Project_Phase}
                    </span>
                  </div>

                  <span className="history-document-id">
                    {analysis.id}
                  </span>

                  <span
                    className={`history-risk-badge risk-${riskLevel.toLowerCase()}`}
                  >
                    {riskLevel}
                  </span>

                  <strong>
                    {(confidence * 100).toFixed(1)}%
                  </strong>

                  <span>
                    {formatDate(analysis.created_at)}
                  </span>
                </button>
              );
            })}

          </div>

        </section>

      </div>
    </div>
  );
}

export default History;