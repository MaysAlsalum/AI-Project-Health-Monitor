import os
import shutil
import tempfile

import numpy as np
import tensorflow as tf

from fastapi import FastAPI, Request, HTTPException
from google.cloud import storage


app = FastAPI()

MODEL = None
PREDICT_FN = None


def download_gcs_folder(gcs_uri: str, local_dir: str):
    """
    Download all files from a GCS folder into a local directory.
    Example:
    gs://bucket-name/project_risk_savedmodel/
    """

    if not gcs_uri.startswith("gs://"):
        raise ValueError("Expected a gs:// Cloud Storage URI")

    path = gcs_uri[5:]
    bucket_name, prefix = path.split("/", 1)

    prefix = prefix.rstrip("/") + "/"

    client = storage.Client()
    bucket = client.bucket(bucket_name)

    blobs = client.list_blobs(
        bucket,
        prefix=prefix
    )

    downloaded = 0

    for blob in blobs:
        relative_path = blob.name[len(prefix):]

        if not relative_path:
            continue

        local_path = os.path.join(
            local_dir,
            relative_path
        )

        os.makedirs(
            os.path.dirname(local_path),
            exist_ok=True
        )

        blob.download_to_filename(local_path)
        downloaded += 1

    if downloaded == 0:
        raise RuntimeError(
            f"No model files found at {gcs_uri}"
        )


@app.on_event("startup")
def load_model():
    global MODEL, PREDICT_FN

    storage_uri = os.environ.get("AIP_STORAGE_URI")

    if storage_uri:
        print(f"Downloading model from: {storage_uri}")

        model_path = tempfile.mkdtemp(
            prefix="project_risk_model_"
        )

        download_gcs_folder(
            storage_uri,
            model_path
        )

    else:
        model_path = "/model"

    print(f"Loading model from: {model_path}")

    MODEL = tf.saved_model.load(model_path)

    PREDICT_FN = MODEL.signatures[
        "serving_default"
    ]

    print("Model loaded successfully!")


@app.get("/health")
def health():
    if PREDICT_FN is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not ready"
        )

    return {"status": "healthy"}


@app.post("/predict")
async def predict(request: Request):
    if PREDICT_FN is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not ready"
        )

    body = await request.json()

    instances = body.get("instances")

    if instances is None:
        raise HTTPException(
            status_code=400,
            detail="Request must contain 'instances'"
        )

    try:
        input_array = np.asarray(
            instances,
            dtype=np.float32
        )

        if input_array.ndim != 2:
            raise ValueError(
                "Input must be a 2D array"
            )

        if input_array.shape[1] != 120:
            raise ValueError(
                f"Expected 120 features, received {input_array.shape[1]}"
            )

        tensor = tf.convert_to_tensor(
            input_array,
            dtype=tf.float32
        )

        result = PREDICT_FN(inputs=tensor)

        probabilities = result["output_0"].numpy()

        return {
            "predictions": probabilities.tolist()
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )