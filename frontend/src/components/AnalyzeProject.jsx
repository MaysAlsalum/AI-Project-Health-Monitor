import { useEffect, useState } from "react";

const API_URL = "https://project-health-backend-726081684022.us-central1.run.app";

const FIELD_SECTIONS = [
  {
    title: "Project Overview",
    subtitle: "Core project scope, timeline, budget, and delivery setup.",
    className: "section-blue",
    fields: [
      "Project_Type",
      "Project_Phase",
      "Methodology_Used",
      "Estimated_Timeline_Months",
      "Project_Budget_USD",
      "Team_Size",
      "Stakeholder_Count",
      "Past_Similar_Projects",
      "External_Dependencies_Count",
      "Project_Start_Month",
      "Current_Phase_Duration_Months",
      "Funding_Source",
    ],
  },
  {
    title: "Complexity & Change",
    subtitle:
      "Technical complexity, dependencies, stability, and change indicators.",
    className: "section-green",
    fields: [
      "Complexity_Score",
      "Change_Request_Frequency",
      "Requirement_Stability",
      "Integration_Complexity",
      "Technical_Debt_Level",
      "Technology_Familiarity",
      "Cross_Functional_Dependencies",
      "Organizational_Change_Frequency",
      "Geographical_Distribution",
      "Schedule_Pressure",
      "Market_Volatility",
      "Seasonal_Risk_Factor",
    ],
  },
  {
    title: "Risk & Performance",
    subtitle:
      "Historical risk, delivery performance, governance, and project controls.",
    className: "section-orange",
    fields: [
      "Historical_Risk_Incidents",
      "Vendor_Reliability_Score",
      "Previous_Delivery_Success_Rate",
      "Regulatory_Compliance_Level",
      "Risk_Management_Maturity",
      "Change_Control_Maturity",
      "Data_Security_Requirements",
      "Budget_Utilization_Rate",
      "Priority_Level",
      "Executive_Sponsorship",
      "Contract_Type",
      "Industry_Volatility",
    ],
  },
  {
    title: "Team, Resources & Stakeholders",
    subtitle:
      "Team capability, resources, communication, and stakeholder readiness.",
    className: "section-purple",
    fields: [
      "Team_Experience_Level",
      "Project_Manager_Experience",
      "Team_Turnover_Rate",
      "Resource_Availability",
      "Resource_Contention_Level",
      "Stakeholder_Engagement_Level",
      "Key_Stakeholder_Availability",
      "Communication_Frequency",
      "Org_Process_Maturity",
      "Documentation_Quality",
      "Team_Colocation",
      "Client_Experience_Level",
      "Tech_Environment_Stability",
    ],
  },
];

function formatFieldName(field) {
  return field.replaceAll("_", " ");
}

function AnalyzeProject({ onBack }) {
  const [projectData, setProjectData] = useState({});
  const [projectUpdate, setProjectUpdate] = useState("");
  const [loadingSample, setLoadingSample] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    async function loadSample() {
      try {
        const response = await fetch(`${API_URL}/sample-request`);

        if (!response.ok) {
          throw new Error("Failed to load project template.");
        }

        const data = await response.json();

        setProjectData(data.project_data);
        setProjectUpdate(data.project_update);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSample(false);
      }
    }

    loadSample();
  }, []);

  function handleFieldChange(field, originalValue, newValue) {
    let finalValue = newValue;

    if (typeof originalValue === "number") {
      finalValue = newValue === "" ? null : Number(newValue);
    }

    setProjectData((previous) => ({
      ...previous,
      [field]: finalValue,
    }));
  }


async function handleProjectFileUpload(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  setUploadingFile(true);
  setError("");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_URL}/extract-project-data`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to extract project data."
      );
    }

    setProjectData(data.project_data);
    setUploadedFileName(file.name);

  } catch (err) {
    setError(err.message);
  } finally {
    setUploadingFile(false);
  }
}

  async function handleAnalyze(event) {
    event.preventDefault();

    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: projectName,
          project_data: projectData,
          project_update: projectUpdate,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Project analysis failed.");
      }

      setResult(data);

      setTimeout(() => {
        document
          .getElementById("analysis-results")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  if (loadingSample) {
    return (
      <div className="analysis-page">
        <div className="loading-card">
          Loading project template...
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <div className="analysis-top-actions">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>

        <header className="analysis-title">
            <h1>PROJECT ANALYSIS</h1>
        </header>

        <form onSubmit={handleAnalyze}>
            <section className="upload-project-card">
                <div className="upload-project-content">
                    <div>
                    <span className="section-kicker">QUICK IMPORT</span>
                    <h2>Upload Project File</h2>
                    <p>
                        Upload a CSV or Excel file to automatically fill the
                        49 project features.
                    </p>
                    </div>

                    <label className="upload-project-button">
                    {uploadingFile ? "Reading File..." : "Choose File"}

                    <input
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleProjectFileUpload}
                        disabled={uploadingFile}
                        hidden
                    />
                    </label>
                </div>

                {uploadedFileName && (
                    <div className="uploaded-file-message">
                    <span className="uploaded-dot"></span>

                    <div className="project-name-field">
                        <label>Project Name</label>

                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="e.g. CRM Migration Project"
                        />
                    </div>

                    <div>
                        <strong>{uploadedFileName}</strong>
                        <p>Project information filled successfully.</p>
                    </div>
                    </div>
                )}
            </section>
        
          <section className="form-section project-information-card">
            <div className="project-info-heading">
              <div className="title-with-accent">
                <div className="title-accent-icon">01</div>

                <div>
                  <span className="section-kicker">
                    STRUCTURED INPUT
                  </span>

                  <h2>Project Information</h2>

                  <p>
                    These 49 project features are processed by the
                    Vertex AI V3 risk prediction model.
                  </p>
                </div>
              </div>

              <span className="field-count">
                {Object.keys(projectData).length} Features
              </span>
            </div>

            <div className="project-sections">
              {FIELD_SECTIONS.map((section, sectionIndex) => (
                <div
                  className={`project-subsection ${section.className}`}
                  key={section.title}
                >
                  <div className="subsection-heading">
                    <span className="section-number">
                      {String(sectionIndex + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h3>{section.title}</h3>
                      <p>{section.subtitle}</p>
                    </div>
                  </div>

                  <div className="fields-grid">
                    {section.fields.map((field) => {
                      if (!(field in projectData)) {
                        return null;
                      }

                      const value = projectData[field];

                      return (
                        <div className="form-field" key={field}>
                          <label htmlFor={field}>
                            {formatFieldName(field)}
                          </label>

                          <input
                            id={field}
                            type={
                              typeof value === "number"
                                ? "number"
                                : "text"
                            }
                            step={
                              typeof value === "number"
                                ? "any"
                                : undefined
                            }
                            value={value ?? ""}
                            placeholder={
                              value === null
                                ? "Not available"
                                : ""
                            }
                            onChange={(event) =>
                              handleFieldChange(
                                field,
                                value,
                                event.target.value
                              )
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="form-section status-update-section">

            <div className="form-section-header status-title-row">

                <div className="status-icon">
                02
                </div>

                <div className="status-update-inline">

                <span className="section-kicker">
                    UNSTRUCTURED INPUT
                </span>

                <h2>
                    Project Status Update
                </h2>

                <p>
                    Describe what is currently happening in the project.
                    Gemini will analyze issues, causes, impact, and recommended actions.
                </p>

                </div>

            </div>

            <textarea
                className="project-update-input"
                value={projectUpdate}
                onChange={(e) => setProjectUpdate(e.target.value)}
            />

            <div className="textarea-meta">
                {projectUpdate.length} characters
            </div>

            </section>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onBack}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button analyze-button"
              disabled={analyzing}
            >
              {analyzing
                ? "Analyzing Project..."
                : "Analyze Project"}
            </button>
          </div>
        </form>

        {result && (
          <section
            className="analysis-results"
            id="analysis-results"
          >
            <div className="results-banner">
              <div>
                <span className="results-kicker">
                  AI ANALYSIS COMPLETE
                </span>

                <h2>Project Health Assessment</h2>

                <p>
                  Generated using Vertex AI V3 and Gemini 2.5 Flash.
                </p>
              </div>

              <div
                className={`overall-risk-pill risk-${result.risk_prediction.risk_level.toLowerCase()}`}
              >
                {result.risk_prediction.risk_level} Risk
              </div>
            </div>

            <div className="risk-summary-grid">
              <div className="primary-risk-card">
                <span>Predicted Risk Level</span>

                <strong>
                  {result.risk_prediction.risk_level}
                </strong>

                <p>
                  {(
                    result.risk_prediction.confidence * 100
                  ).toFixed(1)}
                  % confidence
                </p>
              </div>

              {Object.entries(
                result.risk_prediction.probabilities
              ).map(([risk, probability]) => (
                <div
                  className={`probability-card probability-${risk.toLowerCase()}`}
                  key={risk}
                >
                  <span>{risk}</span>

                  <strong>
                    {(probability * 100).toFixed(1)}%
                  </strong>

                  <div className="probability-track">
                    <div
                      className="probability-fill"
                      style={{
                        width: `${probability * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="analysis-insights-grid">
              <article className="insight-card summary-card">
                <div className="insight-heading">
                  <span className="insight-icon">01</span>
                  <h3>Executive Summary</h3>
                </div>

                <p>
                  {
                    result.project_analysis
                      .executive_summary
                  }
                </p>
              </article>

              <article className="insight-card happened-card">
                <div className="insight-heading">
                  <span className="insight-icon">02</span>
                  <h3>What Happened</h3>
                </div>

                <p>
                  {result.project_analysis.what_happened}
                </p>
              </article>

              <article className="insight-card cause-card">
                <div className="insight-heading">
                  <span className="insight-icon">03</span>
                  <h3>Root Causes</h3>
                </div>

                <ul>
                  {result.project_analysis.root_causes.map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </article>

              <article className="insight-card risks-card">
                <div className="insight-heading">
                  <span className="insight-icon">04</span>
                  <h3>Identified Risks</h3>
                </div>

                <div className="risk-list">
                  {result.project_analysis.risks.map(
                    (risk, index) => (
                      <div
                        className="risk-item"
                        key={index}
                      >
                        <span>{risk.risk}</span>

                        <strong
                          className={`severity-badge severity-${risk.severity.toLowerCase()}`}
                        >
                          {risk.severity}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              </article>

              <article className="insight-card impact-card">
                <div className="insight-heading">
                  <span className="insight-icon">05</span>
                  <h3>Expected Impact</h3>
                </div>

                <ul>
                  {result.project_analysis.expected_impact.map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </article>

              <article className="insight-card actions-card">
                <div className="insight-heading">
                  <span className="insight-icon">06</span>
                  <h3>Recommended Actions</h3>
                </div>

                <ul>
                  {result.project_analysis.recommended_actions.map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </article>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default AnalyzeProject;