from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict

import io
from pathlib import Path
import pandas as pd

from fastapi.middleware.cors import CORSMiddleware
from backend.services.risk_service import predict_project_risk
from backend.services.gemini_service import analyze_project_update
from fastapi import UploadFile, File

from backend.services.firestore_service import get_dashboard_stats, get_project_analyses, save_project_analysis


app = FastAPI(
    title="AI Project Health Monitor API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATASET_PATH = (
    PROJECT_ROOT
    / "data"
    / "project_risk_raw_dataset.csv"
)


class ProjectAnalysisRequest(BaseModel):
    project_data: Dict[str, Any]
    project_update: str
    project_name: str


@app.get("/")
def root():
    return {
        "message": "AI Project Health Monitor API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/sample-request")
def sample_request():
    """
    Return a valid sample request using a real row
    from the model training dataset.
    """

    risk_df = pd.read_csv(DATASET_PATH)

    row = risk_df.iloc[0]

    project_data = row.drop(
        labels=["Project_ID", "Risk_Level"]
    ).to_dict()

    # JSON cannot represent NaN values
    project_data = {
        key: None if pd.isna(value) else value
        for key, value in project_data.items()
    }

    return {
        "project_data": project_data,
        "project_update": (
            "The CRM migration project is two weeks behind schedule. "
            "The external vendor has not delivered the required API endpoints. "
            "The backend development team is blocked and integration testing "
            "has been postponed. If the vendor issue is not resolved this week, "
            "the production launch may be delayed."
        )
    }



@app.post("/analyze")
def analyze_project(request: ProjectAnalysisRequest):
    try:
        risk_result = predict_project_risk(
            request.project_data
        )

        gemini_result = analyze_project_update(
            request.project_update
        )

        analysis_id = save_project_analysis(
            project_name=request.project_name,
            project_data=request.project_data,
            project_update=request.project_update,
            risk_prediction=risk_result,
            project_analysis=gemini_result,
        )

        return {
            "analysis_id": analysis_id,
            "risk_prediction": risk_result,
            "project_analysis": gemini_result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


    

@app.get("/analyses")
def analyses():
    try:
        return {
            "analyses": get_project_analyses()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@app.get("/analyses/recent")
def recent_analyses():
    try:
        return {
            "analyses": get_project_analyses(limit=5)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@app.get("/dashboard")
def dashboard():
    try:
        return get_dashboard_stats()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )



@app.post("/extract-project-data")
async def extract_project_data(file: UploadFile = File(...)):
    try:
        filename = file.filename.lower()

        contents = await file.read()

        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))

        elif filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))

        else:
            raise HTTPException(
                status_code=400,
                detail="Only CSV and XLSX files are supported."
            )

        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty."
            )

        # Take the first project row
        row = df.iloc[0].to_dict()

        # Convert NaN values to None
        cleaned_data = {}

        for key, value in row.items():
            if pd.isna(value):
                cleaned_data[key] = None
            else:
                cleaned_data[key] = value

        return {
            "project_data": cleaned_data,
            "columns_found": list(df.columns),
            "row_count": len(df)
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )