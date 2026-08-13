import pandas as pd
import numpy as np
import joblib

from google.cloud import aiplatform


PROJECT_ID = "ai-project-health-monitor"
LOCATION = "us-central1"
ENDPOINT_ID = "645462253771948032"


# 1. Initialize Vertex AI
aiplatform.init(
    project=PROJECT_ID,
    location=LOCATION
)


# 2. Load our saved preprocessor
preprocessor = joblib.load(
    "models/preprocessor_v3.pkl"
)


# 3. Load one project from the dataset
risk_df = pd.read_csv(
    "data/project_risk_raw_dataset.csv"
)

sample_project = risk_df.drop(
    columns=["Project_ID", "Risk_Level"]
).iloc[[0]].copy()


# 4. Transform 49 raw features -> 120 processed features
sample_processed = preprocessor.transform(
    sample_project
)

sample_processed = np.asarray(
    sample_processed,
    dtype=np.float32
)

print("Processed shape:", sample_processed.shape)


# 5. Connect to deployed Vertex AI Endpoint
endpoint = aiplatform.Endpoint(
    endpoint_name=ENDPOINT_ID
)


# 6. Send prediction
response = endpoint.predict(
    instances=sample_processed.tolist()
)


print("\nVertex AI response:")
print(response.predictions)