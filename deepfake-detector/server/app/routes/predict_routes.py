from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from datetime import datetime
import os
import uuid

from ..dependencies import get_current_user
from ..utils import convert_to_wav, extract_features_safe
from ..model_loader import predict
from ..database import predictions_collection

router = APIRouter(prefix="/api", tags=["predict"])


@router.post("/predict")
async def run_prediction(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    file_path = None
    wav_path = None

    try:
        # Save uploaded file to temp
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        file_path = f"temp_{unique_name}"

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # Convert uploaded file to WAV
        wav_path = convert_to_wav(file_path)

        # Extract MFCC safely
        features = extract_features_safe(wav_path)

        if features is None:
            raise HTTPException(
                status_code=400,
                detail="Error processing audio file. Please ensure it's a valid audio format."
            )

        # Run inference
        prediction_label, confidence, spoof_probability = predict(features)

        # Format result document
        timestamp = datetime.utcnow()
        prediction_doc = {
            "user_id": current_user["_id"],
            "filename": file.filename,
            "prediction": prediction_label,
            "confidence": round(float(confidence) * 100, 2),
            "spoof_probability": round(float(spoof_probability) * 100, 2),   # 👈 ADD THIS
            "timestamp": timestamp
        }

        # Save to DB
        result = predictions_collection.insert_one(prediction_doc)

        # Return response
        return {
            "id": str(result.inserted_id),
            "filename": file.filename,
            "prediction": prediction_label,
            "confidence": round(float(confidence) * 100, 2),
            "spoof_probability": round(float(spoof_probability) * 100, 2),  # 👈 ADD THIS
            "timestamp": timestamp
        }

    except HTTPException as e:
        raise e

    except Exception as e:
        print("🔥 Prediction error:", e)
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