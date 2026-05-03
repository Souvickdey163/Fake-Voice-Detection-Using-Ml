import os
import time
from functools import lru_cache


HF_SPACE_URL = (os.getenv("HF_SPACE_URL") or os.getenv("HF_SPACE_ID") or "").rstrip("/")
HF_API_NAME = os.getenv("HF_API_NAME", "/predict")
HF_MAX_RETRIES = int(os.getenv("HF_MAX_RETRIES", "3"))
HF_RETRY_DELAY_SECONDS = float(os.getenv("HF_RETRY_DELAY_SECONDS", "2"))


def is_hf_enabled():
    return bool(HF_SPACE_URL)


@lru_cache(maxsize=1)
def get_hf_client():
    if not HF_SPACE_URL:
        raise RuntimeError("HF_SPACE_URL is not configured")

    from gradio_client import Client

    return Client(HF_SPACE_URL)


def _extract_probability(probabilities, key):
    if not probabilities:
        return None

    if isinstance(probabilities, dict):
        if key in probabilities:
            return float(probabilities[key])

        confidences = probabilities.get("confidences")
        if isinstance(confidences, list):
            for item in confidences:
                if item.get("label") == key:
                    return float(item.get("confidence", 0))

    return None


def _normalize_hf_result(result):
    if isinstance(result, (list, tuple)):
        prediction_text = str(result[0]) if result else ""
        probabilities = result[1] if len(result) > 1 else {}
    else:
        prediction_text = str(result)
        probabilities = {}

    real_probability = _extract_probability(probabilities, "Real Voice")
    fake_probability = _extract_probability(probabilities, "Fake Voice")

    if fake_probability is None:
        fake_probability = 1.0 if "fake" in prediction_text.lower() else 0.0

    if real_probability is None:
        real_probability = max(0.0, 1.0 - fake_probability)

    is_fake = fake_probability >= real_probability or "fake" in prediction_text.lower()
    confidence = max(real_probability, fake_probability)

    return (
        "Spoof (Fake)" if is_fake else "Bonafide (Real)",
        confidence,
        fake_probability,
    )


def predict_with_hf(file_path):
    from gradio_client import handle_file

    client = get_hf_client()

    last_error = None
    for attempt in range(1, HF_MAX_RETRIES + 1):
        try:
            print(
                f"[predict] calling HF Space {HF_SPACE_URL} "
                f"(attempt {attempt}/{HF_MAX_RETRIES})",
                flush=True,
            )
            result = client.predict(handle_file(file_path), api_name=HF_API_NAME)
            print("[predict] HF response received", flush=True)
            return _normalize_hf_result(result)
        except Exception as exc:
            last_error = exc
            print(f"[predict] HF attempt {attempt} failed: {exc}", flush=True)
            if attempt < HF_MAX_RETRIES:
                time.sleep(HF_RETRY_DELAY_SECONDS)

    raise RuntimeError(f"HF prediction failed after {HF_MAX_RETRIES} attempts") from last_error
