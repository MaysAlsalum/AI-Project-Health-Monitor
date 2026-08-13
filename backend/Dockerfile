FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt

RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt


COPY backend ./backend
COPY models/preprocessor_v3.pkl ./models/preprocessor_v3.pkl
COPY data/project_risk_raw_dataset.csv ./data/project_risk_raw_dataset.csv


ENV PORT=8080

CMD ["sh", "-c", "python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]