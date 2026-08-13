from datetime import datetime, timezone

from google.cloud import firestore


db = firestore.Client(project="ai-project-health-monitor")

COLLECTION_NAME = "project_analyses"


def save_project_analysis(
    project_name,
    project_data,
    project_update,
    risk_prediction,
    project_analysis,
):
    """
    Save one completed project analysis to Firestore.
    """

    document = {
    "project_name": project_name,
    "project_data": project_data,
    "project_update": project_update,
    "risk_prediction": risk_prediction,
    "project_analysis": project_analysis,
    "created_at": datetime.now(timezone.utc),
    }

    doc_ref = db.collection(COLLECTION_NAME).document()
    doc_ref.set(document)

    return doc_ref.id




def get_project_analyses(limit=None):
    query = (
        db.collection(COLLECTION_NAME)
        .order_by("created_at", direction=firestore.Query.DESCENDING)
    )

    if limit:
        query = query.limit(limit)

    documents = query.stream()

    analyses = []

    for doc in documents:
        data = doc.to_dict()

        created_at = data.get("created_at")
        if created_at:
            data["created_at"] = created_at.isoformat()

        analyses.append({
            "id": doc.id,
            **data,
        })

    return analyses


def get_dashboard_stats():
    documents = db.collection(COLLECTION_NAME).stream()

    total_projects = 0
    high_risk = 0
    critical_risk = 0
    ai_analyses = 0

    for doc in documents:
        data = doc.to_dict()

        total_projects += 1

        risk_level = (
            data.get("risk_prediction", {})
            .get("risk_level", "")
        )

        if risk_level == "High":
            high_risk += 1

        if risk_level == "Critical":
            critical_risk += 1

        if data.get("project_analysis"):
            ai_analyses += 1

    return {
        "total_projects": total_projects,
        "high_risk": high_risk,
        "critical_risk": critical_risk,
        "ai_analyses": ai_analyses,
    }