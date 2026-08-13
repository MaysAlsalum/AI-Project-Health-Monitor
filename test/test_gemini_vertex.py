from google import genai
from google.genai.types import HttpOptions
from google.genai import types


PROJECT_ID = "ai-project-health-monitor"
LOCATION = "global"

client = genai.Client(
    vertexai=True,
    project=PROJECT_ID,
    location=LOCATION,
    http_options=HttpOptions(api_version="v1")
)

project_update = """
The CRM migration project is currently two weeks behind schedule.

The external vendor has not delivered the required API endpoints.
Because of this, the backend development team is blocked and integration
testing has been postponed.

The project manager expects the delay to affect the production launch if
the vendor issue is not resolved this week.
"""

prompt = f"""
You are an AI Project Health Analyst.

Analyze the following project status update.

Identify:
- executive summary
- what happened
- root causes
- major risks and severity
- expected impact
- recommended actions

Project update:
{project_update}
"""

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema={
            "type": "OBJECT",
            "properties": {
                "executive_summary": {
                    "type": "STRING"
                },
                "what_happened": {
                    "type": "STRING"
                },
                "root_causes": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "risks": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "risk": {"type": "STRING"},
                            "severity": {
                                "type": "STRING",
                                "enum": ["Low", "Medium", "High", "Critical"]
                            }
                        },
                        "required": ["risk", "severity"]
                    }
                },
                "expected_impact": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "recommended_actions": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                }
            },
            "required": [
                "executive_summary",
                "what_happened",
                "root_causes",
                "risks",
                "expected_impact",
                "recommended_actions"
            ]
        }
    )
)

print(response.text)