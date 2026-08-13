import requests
import pandas as pd
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


risk_df = pd.read_csv(
    PROJECT_ROOT / "data" / "project_risk_raw_dataset.csv"
)

row = risk_df.iloc[0]

project_data = row.drop(
    labels=["Project_ID", "Risk_Level"]
).to_dict()


# Convert NaN values to None so JSON can handle them
project_data = {
    key: None if pd.isna(value) else value
    for key, value in project_data.items()
}


payload = {
    "project_data": project_data,

    "project_update": """
    The CRM migration project is two weeks behind schedule.
    The external vendor has not delivered the required API endpoints.
    The backend development team is blocked and integration testing
    has been postponed. If the issue is not resolved this week,
    the production launch may be delayed.
    """
}


response = requests.post(
    "http://127.0.0.1:8000/analyze",
    json=payload,
    timeout=120
)


print("Status Code:", response.status_code)

print("\nResponse:")
print(response.json())