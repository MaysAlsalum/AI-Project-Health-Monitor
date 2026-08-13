from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from google.cloud import aiplatform


PROJECT_ID = "ai-project-health-monitor"
LOCATION = "us-central1"
ENDPOINT_ID = "645462253771948032"

RISK_CLASSES = ["Low", "Medium", "High", "Critical"]

# Project root:
# backend/services/risk_service.py -> services -> backend -> project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]

PREPROCESSOR_PATH = PROJECT_ROOT / "models" / "preprocessor_v3.pkl"


# Initialize Vertex AI once
aiplatform.init(
    project=PROJECT_ID,
    location=LOCATION
)

# Load preprocessing pipeline once
preprocessor = joblib.load(PREPROCESSOR_PATH)

# Connect to deployed V3 endpoint
endpoint = aiplatform.Endpoint(
    endpoint_name=ENDPOINT_ID
)


def predict_project_risk(project_data: dict) -> dict:
    """
    Predict project risk using the deployed V3 model on Vertex AI.

    project_data:
        Dictionary containing the raw project features expected
        by the preprocessing pipeline.
    """

    # Convert one project into a DataFrame
    project_df = pd.DataFrame([project_data])

    # Raw features -> 120 model features
    processed = preprocessor.transform(project_df)

    processed = np.asarray(
        processed,
        dtype=np.float32
    )

    # Vertex AI online prediction
    response = endpoint.predict(
        instances=processed.tolist()
    )

    probabilities = np.asarray(
        response.predictions[0],
        dtype=float
    )

    predicted_index = int(np.argmax(probabilities))
    predicted_class = RISK_CLASSES[predicted_index]

    probability_dict = {
        risk_class: float(probability)
        for risk_class, probability in zip(
            RISK_CLASSES,
            probabilities
        )
    }

    return {
        "risk_level": predicted_class,
        "confidence": float(probabilities[predicted_index]),
        "probabilities": probability_dict
    }