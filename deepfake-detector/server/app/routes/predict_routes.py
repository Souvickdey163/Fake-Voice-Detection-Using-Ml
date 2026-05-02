from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from datetime import datetime
import os
import time
import uuid

from ..dependencies import get_current_user
from ..database import predictions_collection
from ..plan_utils import build_credit_summary

router = APIRouter(prefix="/api", tags=["predict"])


def build_analysis_report(prediction_label: str, confidence: float, spoof_probability: float):
    confidence_pct = round(float(confidence) * 100, 2)
    fake_probability_pct = round(float(spoof_probability) * 100, 2)
    authenticity_pct = round(max(0.0, 100 - fake_probability_pct), 2)
    is_fake = "spoof" in prediction_label.lower() or "fake" in prediction_label.lower()

    summary = (
        "The recording shows elevated spoofing signals and should be treated cautiously before it is trusted or shared."
        if is_fake
        else "The recording shows mostly natural voice patterns with no major synthetic anomalies in the detected feature set."
    )

    details = {
        "vocalConsistency": (
            "The model detected unstable vocal transitions and timing patterns that can appear in synthesized or heavily altered speech."
            if is_fake
            else "Natural pitch movement and speaking cadence are present, which aligns more closely with authentic human speech."
        ),
        "backgroundNoise": (
            "The background texture appears relatively flat, which can happen when generated audio lacks realistic environmental variation."
            if is_fake
            else "Ambient noise remains consistent across the clip without obvious looping or masking artifacts."
        ),
        "spectrogram": (
            "Spectral patterns suggest synthetic artifacts in the higher-frequency structure and energy distribution."
            if is_fake
            else "Spectral energy distribution appears balanced, with no dominant synthetic artifacts surfaced by the model."
        ),
    }

    return {
        "score": authenticity_pct,
        "label": "Likely Fake" if is_fake else "Likely Authentic",
        "summary": summary,
        "breakdown": {
            "authenticity": authenticity_pct,
            "fakeProbability": fake_probability_pct,
            "modelConfidence": confidence_pct,
        },
        "details": details,
    }


@router.post("/predict")
async def run_prediction(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    from ..model_loader import predict
    from ..utils import convert_to_wav, extract_features_safe

    file_path = None
    wav_path = None
    request_start = time.perf_counter()

    try:
        print(f"[predict] request started for {file.filename}", flush=True)
        step_start = time.perf_counter()
        used_credits = predictions_collection.count_documents({"user_id": current_user["_id"]})
        credit_summary = build_credit_summary(current_user.get("plan"), used_credits)
        print(f"[predict] credit check done in {time.perf_counter() - step_start:.2f}s", flush=True)

        if credit_summary["credits"]["left"] <= 0:
            raise HTTPException(
                status_code=403,
                detail=f"You have used all {credit_summary['credits']['total']} credits on your {credit_summary['plan']} plan."
            )

        # Save uploaded file to temp
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        file_path = f"temp_{unique_name}"

        step_start = time.perf_counter()
        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        print(
            f"[predict] upload saved in {time.perf_counter() - step_start:.2f}s "
            f"({len(contents)} bytes)",
            flush=True
        )

        # Convert uploaded file to WAV
        step_start = time.perf_counter()
        wav_path = convert_to_wav(file_path)
        print(f"[predict] convert step total {time.perf_counter() - step_start:.2f}s", flush=True)

        # Extract MFCC safely
        step_start = time.perf_counter()
        features = extract_features_safe(wav_path)
        print(f"[predict] feature step total {time.perf_counter() - step_start:.2f}s", flush=True)

        if features is None:
            raise HTTPException(
                status_code=400,
                detail="Error processing audio file. Please ensure it's a valid audio format."
            )

        # Run inference
        step_start = time.perf_counter()
        prediction_label, confidence, spoof_probability = predict(features)
        print(f"[predict] inference step total {time.perf_counter() - step_start:.2f}s", flush=True)
        analysis_report = build_analysis_report(
            prediction_label,
            confidence,
            spoof_probability
        )

        # Format result document
        timestamp = datetime.utcnow()
        prediction_doc = {
            "user_id": current_user["_id"],
            "filename": file.filename,
            "prediction": prediction_label,
            "confidence": round(float(confidence) * 100, 2),
            "spoof_probability": round(float(spoof_probability) * 100, 2),
            "analysis_report": analysis_report,
            "timestamp": timestamp
        }

        # Save to DB
        step_start = time.perf_counter()
        result = predictions_collection.insert_one(prediction_doc)
        print(f"[predict] db insert done in {time.perf_counter() - step_start:.2f}s", flush=True)

        # Return response
        print(f"[predict] request completed in {time.perf_counter() - request_start:.2f}s", flush=True)
        return {
            "id": str(result.inserted_id),
            "filename": file.filename,
            "prediction": prediction_label,
            "confidence": round(float(confidence) * 100, 2),
            "spoof_probability": round(float(spoof_probability) * 100, 2),
            **analysis_report,
            "timestamp": timestamp
        }

    except HTTPException as e:
        raise e

    except Exception as e:
        print("🔥 Prediction error:", e, flush=True)
        raise HTTPException(status_code=400, detail=f"Audio processing failed: {str(e)}")

    finally:
        # Clean up temp files
        try:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass

        try:
            if wav_path and os.path.exists(wav_path):
                os.remove(wav_path)
        except:
            pass
