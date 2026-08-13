import json

from google import genai
from google.genai import types


PROJECT_ID = "ai-project-health-monitor"
LOCATION = "global"
MODEL_NAME = "gemini-2.5-flash"


client = genai.Client(
    vertexai=True,
    project=PROJECT_ID,
    location=LOCATION
)


def analyze_project_update(project_update: str) -> dict:
    """
    Analyze unstructured project text using Gemini on Vertex AI.
    """

    if not project_update or not project_update.strip():
        raise ValueError("Project update cannot be empty.")

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

Only use information supported by the project update.
Do not invent facts that are not present in the text.

Project update:
{project_update}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
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
                        "items": {
                            "type": "STRING"
                        }
                    },
                    "risks": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "risk": {
                                    "type": "STRING"
                                },
                                "severity": {
                                    "type": "STRING",
                                    "enum": [
                                        "Low",
                                        "Medium",
                                        "High",
                                        "Critical"
                                    ]
                                }
                            },
                            "required": [
                                "risk",
                                "severity"
                            ]
                        }
                    },
                    "expected_impact": {
                        "type": "ARRAY",
                        "items": {
                            "type": "STRING"
                        }
                    },
                    "recommended_actions": {
                        "type": "ARRAY",
                        "items": {
                            "type": "STRING"
                        }
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

    return json.loads(response.text)