import sys
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from backend.services.risk_service import predict_project_risk


risk_df = pd.read_csv(
    PROJECT_ROOT / "data" / "project_risk_raw_dataset.csv"
)

sample_project = risk_df.drop(
    columns=["Project_ID", "Risk_Level"]
).iloc[0].to_dict()

actual_risk = risk_df.iloc[0]["Risk_Level"]

result = predict_project_risk(sample_project)

print("Actual Risk:", actual_risk)
print("Predicted Risk:", result["risk_level"])
print(f"Confidence: {result['confidence']:.2%}")

print("\nProbabilities:")
for risk, probability in result["probabilities"].items():
    print(f"{risk}: {probability:.2%}")