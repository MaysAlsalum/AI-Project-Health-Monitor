from backend.services.gemini_service import analyze_project_update
import json


project_update = """
The CRM migration project is two weeks behind schedule.

The external vendor has not delivered the required API endpoints.
Because of this, the backend development team is blocked and
integration testing has been postponed.

The project manager stated that if the vendor issue is not resolved
this week, the production launch will be delayed.
"""


result = analyze_project_update(project_update)

print("\nGemini Project Analysis:\n")
print(json.dumps(result, indent=2))